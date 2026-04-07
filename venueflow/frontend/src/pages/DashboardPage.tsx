import React from 'react';
import CrowdHeatmap from '../components/CrowdHeatmap';
import QueueStatus from '../components/QueueStatus';
import StaffFeed from '../components/StaffFeed';
import { useCrowdData, CrowdDensity } from '../hooks/useCrowdData';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '0.5rem'
};

const center = {
  lat: 40.7128, // Replace with actual stadium lat
  lng: -74.0060 // Replace with actual stadium lng
};

// Map Sections to pseudo coordinates for visual display
const getSectionCoordinates = (section: string) => {
  // Demo offsets - maps a section string to a latlng
  const map: Record<string, { lat: number, lng: number }> = {
    '101': { lat: 40.7130, lng: -74.0062 },
    '102': { lat: 40.7128, lng: -74.0058 },
    '103': { lat: 40.7126, lng: -74.0060 },
    '104': { lat: 40.7132, lng: -74.0055 },
  };
  return map[section] || { lat: 40.7128 + (Math.random() * 0.002 - 0.001), lng: -74.0060 + (Math.random() * 0.002 - 0.001) };
};

const getMarkerIcon = (density: CrowdDensity) => {
  const colorMap = {
    'LOW': 'green',
    'MEDIUM': 'yellow',
    'HIGH': 'red'
  };
  return `http://maps.google.com/mapfiles/ms/icons/${colorMap[density] || 'red'}-dot.png`;
};

const DashboardPage: React.FC = () => {
  const { crowd, queues, loading } = useCrowdData();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING_API_KEY'
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Stadium Dashboard</h1>
      
      {loading ? (
        <div aria-live="polite" aria-label="Loading..." className="text-gray-500">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded shadow-sm h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Interactive Floor Plan</h2>
                <div className="flex-grow min-h-[400px]">
                {loadError ? (
                  <div className="h-full w-full min-h-[400px] bg-gray-100 flex flex-col items-center justify-center rounded text-red-500 p-4 text-center">
                    <p>Map could not load. Please check your Google Maps API Key.</p>
                  </div>
                ) : isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={17}
                  >
                    {crowd.map(c => (
                      <Marker 
                        key={c.section}
                        position={getSectionCoordinates(c.section)}
                        icon={getMarkerIcon(c.density)}
                        title={`Section ${c.section} - Density: ${c.density}`}
                      />
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="h-full w-full bg-gray-100 animate-pulse rounded min-h-[400px]"></div>
                )}
                </div>
              </div>
            </div>
            <div>
              <QueueStatus queues={queues} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <CrowdHeatmap data={crowd} />
            </div>
            <div>
              <StaffFeed />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
