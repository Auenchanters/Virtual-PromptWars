import React, { useMemo } from 'react';
import { CrowdSection, CrowdDensity } from '../types';
import { densityBgClass, densityLabel } from '../utils/density';

/** Map density level to a visible directional icon for non-colour users. */
function densityIcon(density: CrowdDensity): string {
  switch (density) {
    case 'HIGH': return '▲';
    case 'MEDIUM': return '▶';
    case 'LOW': return '▼';
  }
}

interface CrowdHeatmapProps {
  data: CrowdSection[];
}

const CrowdHeatmap: React.FC<CrowdHeatmapProps> = ({ data }) => {
  const cells = useMemo(() => {
    return data.map((section) => {
      const bgColor = densityBgClass[section.density] ?? 'bg-gray-200';
      const label = densityLabel(section.density);
      return (
        <div
          key={section.section}
          role="listitem"
          className={`${bgColor} flex flex-col justify-center items-center p-4 rounded text-white font-bold h-32`}
          aria-label={`Section ${section.section}, ${label}`}
        >
          <span className="text-lg">Sec {section.section}</span>
          <span className="text-sm bg-black bg-opacity-50 px-2 py-1 mt-2 rounded">
            <span>{densityIcon(section.density)} </span><span>{section.density}</span>
          </span>
        </div>
      );
    });
  }, [data]);

  return (
    <section className="bg-white p-6 rounded shadow-sm" aria-labelledby="heatmap-heading">
      <h2 id="heatmap-heading" className="text-2xl font-bold mb-4">
        Stadium Crowd Heatmap
      </h2>
      <div
        role="list"
        aria-label="Stadium crowd density map"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {cells.length > 0 ? cells : <p className="col-span-full text-gray-500">No data available</p>}
      </div>
    </section>
  );
};

export default CrowdHeatmap;
