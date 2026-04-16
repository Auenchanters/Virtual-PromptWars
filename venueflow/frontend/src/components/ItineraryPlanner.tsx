import React, { useState, useRef } from 'react';
import { getItinerary } from '../services/api';
import { MAX_SECTION_LENGTH } from '../utils/constants';

const ItineraryPlanner: React.FC = () => {
  const [section, setSection] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inflightRef.current) return;
    const trimmed = section.trim();
    if (!trimmed) {
      setError('Please enter your seating section.');
      return;
    }
    setError(null);
    setLoading(true);
    inflightRef.current = true;
    try {
      const response = await getItinerary(trimmed);
      setItinerary(response);
    } catch {
      setError('We could not generate your itinerary. Please try again.');
      setItinerary('');
    } finally {
      setLoading(false);
      inflightRef.current = false;
    }
  };

  return (
    <section
      className="bg-white p-6 rounded shadow-sm mt-8"
      aria-labelledby="itinerary-heading"
    >
      <h2 id="itinerary-heading" className="text-2xl font-bold mb-4">
        Personalized Event Itinerary Planner
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="section-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter your seating section
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="section-input"
              type="text"
              value={section}
              onChange={(event) => setSection(event.target.value)}
              maxLength={MAX_SECTION_LENGTH}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'section-error' : undefined}
              className="border rounded px-4 py-2 w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 112"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white font-bold px-6 py-2 rounded hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Planner'}
            </button>
          </div>
          {error && (
            <p id="section-error" role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </form>

      {itinerary && (
        <div
          className="mt-6 p-4 border rounded bg-gray-50"
          role="region"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Generated itinerary"
        >
          <h3 className="font-bold text-lg mb-2">Your Itinerary</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{itinerary}</p>
        </div>
      )}
    </section>
  );
};

export default ItineraryPlanner;
