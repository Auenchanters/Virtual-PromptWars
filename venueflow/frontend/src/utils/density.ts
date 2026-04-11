import { CrowdDensity } from '../types';

export const densityBgClass: Record<CrowdDensity, string> = {
  LOW: 'bg-green-600',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-red-700',
};

const markerColorByDensity: Record<CrowdDensity, string> = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'red',
};

export function densityMarkerIcon(density: CrowdDensity): string {
  const color = markerColorByDensity[density] ?? 'red';
  return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
}

export function densityLabel(density: CrowdDensity): string {
  switch (density) {
    case 'LOW':
      return 'Low crowd';
    case 'MEDIUM':
      return 'Moderate crowd';
    case 'HIGH':
      return 'High crowd';
  }
}
