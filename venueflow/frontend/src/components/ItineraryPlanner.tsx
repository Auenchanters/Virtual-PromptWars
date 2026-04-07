import React, { useState } from 'react';
import { getItinerary } from '../services/api';

const ItineraryPlanner: React.FC = () => {
  const [section, setSection] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section.trim()) return;
    setLoading(true);
    try {
      const resp = await getItinerary(section);
      setItinerary(resp);
    } catch {
      setItinerary('Error generating itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm mt-8">
      <h2 className="text-2xl font-bold mb-4" id="itinerary-heading">Personalized Event Itinerary Planner</h2>
      
      <form onSubmit={handleSubmit} aria-labelledby="itinerary-heading" className="space-y-4">
        <div>
          <label htmlFor="section-input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your seating section
          </label>
          <div className="flex gap-2">
            <input
              id="section-input"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="border rounded px-4 py-2 w-full md:max-w-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 112"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Planner'}
            </button>
          </div>
        </div>
      </form>

      {itinerary && (
        <div className="mt-6 p-4 border rounded bg-gray-50" aria-live="polite">
          <h3 className="font-bold text-lg mb-2">Your Itinerary</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{itinerary}</p>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanner;
