import React, { useEffect, useState } from 'react';
import { fetchCrowdForecast } from '../services/api';

const REFRESH_MS = 60_000;

const CrowdForecast: React.FC = () => {
  const [forecast, setForecast] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const text = await fetchCrowdForecast();
        if (active) {
          setForecast(text);
          setError(null);
        }
      } catch {
        if (active) setError('Forecast temporarily unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section
      aria-labelledby="forecast-heading"
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded p-6 shadow-sm"
    >
      <h2 id="forecast-heading" className="text-xl font-bold text-blue-900 mb-2">
        15-Minute Crowd Outlook
      </h2>
      <div aria-live="polite" aria-busy={loading} className="text-gray-800">
        {loading && <p className="italic text-gray-500">Generating live outlook…</p>}
        {!loading && error && <p className="text-red-700">{error}</p>}
        {!loading && !error && <p className="whitespace-pre-wrap">{forecast}</p>}
      </div>
    </section>
  );
};

export default CrowdForecast;
