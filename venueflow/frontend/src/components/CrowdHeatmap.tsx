import React, { useMemo } from 'react';
import { CrowdSection } from '../hooks/useCrowdData';

interface CrowdHeatmapProps {
  data: CrowdSection[];
}

const CrowdHeatmap: React.FC<CrowdHeatmapProps> = ({ data }) => {
  // useMemo for expensive computation representation
  const sections = useMemo(() => {
    return data.map(item => {
      let bgColor = 'bg-gray-200';
      if (item.density === 'LOW') bgColor = 'bg-green-600';
      if (item.density === 'MEDIUM') bgColor = 'bg-yellow-500';
      if (item.density === 'HIGH') bgColor = 'bg-red-700';

      return (
        <div 
          key={item.section}
          className={`${bgColor} flex flex-col justify-center items-center p-4 rounded text-white font-bold h-32`}
          aria-label={`Section ${item.section}: ${item.density} density`}
        >
          <span className="text-lg">Sec {item.section}</span>
          <span className="text-sm bg-black bg-opacity-50 px-2 py-1 mt-2 rounded">{item.density}</span>
        </div>
      );
    });
  }, [data]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Stadium Crowd Heatmap</h2>
      <div 
        role="grid" 
        aria-label="Stadium crowd density map" 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {sections.length > 0 ? sections : <p>No data available</p>}
      </div>
    </div>
  );
};

export default CrowdHeatmap;
