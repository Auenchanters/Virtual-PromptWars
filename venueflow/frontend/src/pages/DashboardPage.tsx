import React from 'react';
import CrowdHeatmap from '../components/CrowdHeatmap';
import QueueStatus from '../components/QueueStatus';
import StaffFeed from '../components/StaffFeed';
import StadiumMap from '../components/StadiumMap';
import CrowdForecast from '../components/CrowdForecast';
import { useCrowdData } from '../hooks/useCrowdData';

const DashboardPage: React.FC = () => {
  const { crowd, queues, loading, error } = useCrowdData();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Stadium Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Live crowd density, wait times, and AI-guided recommendations for every attendee.
        </p>
      </header>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          {error}
        </div>
      )}

      <CrowdForecast />

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="text-gray-500"
        >
          Loading live venue data…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section
              aria-labelledby="map-heading"
              className="lg:col-span-2 bg-white p-6 rounded shadow-sm flex flex-col"
            >
              <h2 id="map-heading" className="text-2xl font-bold mb-4">
                Interactive Floor Plan
              </h2>
              <div className="flex-grow min-h-[400px]">
                <StadiumMap crowd={crowd} />
              </div>
            </section>
            <QueueStatus queues={queues} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CrowdHeatmap data={crowd} />
            </div>
            <StaffFeed />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
