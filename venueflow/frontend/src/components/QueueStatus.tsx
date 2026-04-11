import React from 'react';
import { QueueItem } from '../types';

interface QueueStatusProps {
  queues: QueueItem[];
}

const QueueStatus: React.FC<QueueStatusProps> = ({ queues }) => {
  if (!queues || queues.length === 0) {
    return (
      <section
        aria-labelledby="queues-heading"
        className="p-4 border rounded shadow-sm bg-white"
      >
        <h2 id="queues-heading" className="text-2xl font-bold mb-2">
          Live Wait Times
        </h2>
        <p className="text-gray-500">No queue data available right now.</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="queues-heading"
      className="bg-white p-6 rounded shadow-sm"
    >
      <h2 id="queues-heading" className="text-2xl font-bold mb-4">
        Live Wait Times
      </h2>
      <ul className="space-y-4">
        {queues.map((queue) => (
          <li
            key={queue.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <span className="font-semibold capitalize text-gray-800">{queue.type}</span>
              <span className="text-gray-500 text-sm ml-2">({queue.id})</span>
            </div>
            <div
              className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full"
              aria-label={`${queue.waitTimeMinutes} minutes wait`}
            >
              {queue.waitTimeMinutes} mins
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QueueStatus;
