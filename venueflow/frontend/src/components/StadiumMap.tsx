import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { CrowdSection } from '../types';
import { densityMarkerIcon, densityLabel } from '../utils/density';

interface StadiumMapProps {
  crowd: CrowdSection[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '0.5rem',
};

const STADIUM_CENTER = { lat: 40.7128, lng: -74.006 };

const libraries: ('marker')[] = ['marker'];

const SECTION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '101': { lat: 40.713, lng: -74.0062 },
  '102': { lat: 40.7128, lng: -74.0058 },
  '103': { lat: 40.7126, lng: -74.006 },
  '104': { lat: 40.7132, lng: -74.0055 },
};

function getSectionPosition(section: string) {
  return SECTION_COORDINATES[section] ?? {
    lat: STADIUM_CENTER.lat + (Math.random() * 0.002 - 0.001),
    lng: STADIUM_CENTER.lng + (Math.random() * 0.002 - 0.001),
  };
}

// Warn rather than throw at module evaluation time so the component degrades
// gracefully in non-Vite environments (Jest, SSR, Storybook) where Vite env
// vars are not injected. The map will simply fail to load and show the
// loadError fallback UI, which is already tested.
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined ?? '';
if (!googleMapsApiKey) {
  console.warn('StadiumMap: VITE_GOOGLE_MAPS_API_KEY is not set. The map will not load.');
}

const StadiumMap: React.FC<StadiumMapProps> = ({ crowd }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries,
  });

  if (loadError) {
    return (
      <div
        role="alert"
        className="h-full w-full min-h-[400px] bg-gray-100 flex flex-col items-center justify-center rounded text-red-600 p-4 text-center"
      >
        <p className="font-semibold">Interactive map could not load.</p>
        <p className="text-sm mt-1">Verify your Google Maps API key and refresh the page.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        role="status"
        aria-label="Loading stadium map"
        className="h-full w-full bg-gray-100 animate-pulse rounded min-h-[400px]"
      />
    );
  }

  return (
    <>
      <p className="sr-only">
        Interactive map. Crowd density data is also available in the fully accessible Crowd Heatmap section below.
      </p>
      <div role="region" aria-label="Stadium crowd density map" className="h-full w-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={STADIUM_CENTER}
          zoom={17}
          options={{ mapId: 'VENUEFLOW_DEMO_MAP' }}
        >
          {crowd.map((section) => (
            <MarkerF
              key={section.section}
              position={getSectionPosition(section.section)}
              icon={densityMarkerIcon(section.density)}
              title={`Section ${section.section} — ${densityLabel(section.density)}`}
            />
          ))}
        </GoogleMap>
      </div>
    </>
  );
};

export default StadiumMap;
