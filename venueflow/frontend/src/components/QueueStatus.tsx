import React from 'react';
import { QueueItem } from '../hooks/useCrowdData';

interface QueueStatusProps {
  queues: QueueItem[];
}

const QueueStatus: React.FC<QueueStatusProps> = ({ queues }) => {
  if (!queues || queues.length === 0) {
    return <div className="p-4 border rounded shadow-sm bg-white">No queue data available</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Live Wait Times</h2>
      <ul className="space-y-4">
        {queues.map((q) => (
          <li key={q.id} className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="font-semibold capitalize text-gray-800">{q.type}</span>
              <span className="text-gray-500 text-sm ml-2">({q.id})</span>
            </div>
            <div className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {q.waitTimeMinutes} mins
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueStatus;
