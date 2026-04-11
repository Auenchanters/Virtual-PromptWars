import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { Broadcast, RawBroadcast } from '../types';
import { BROADCAST_LIMIT } from '../utils/constants';

const StaffFeed: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    let isMounted = true;
    const broadcastsRef = ref(rtdb, 'announcements');

    onValue(
      broadcastsRef,
      (snapshot) => {
        if (!isMounted) return;
        const data = snapshot.val() as Record<string, RawBroadcast> | null;
        if (data) {
          const items: Broadcast[] = Object.entries(data)
            .map(([id, value]) => ({
              id,
              text: value.text,
              time: value.time,
            }))
            .sort((a, b) => b.time - a.time)
            .slice(0, BROADCAST_LIMIT);
          setBroadcasts(items);
        } else {
          setBroadcasts([]);
        }
      },
      () => {
        if (isMounted) setBroadcasts([]);
      }
    );

    return () => {
      isMounted = false;
      off(broadcastsRef);
    };
  }, []);

  return (
    <section
      aria-labelledby="staff-feed-heading"
      className="bg-white p-6 rounded shadow-sm h-full max-h-[600px] flex flex-col"
    >
      <h2 id="staff-feed-heading" className="text-2xl font-bold mb-4 flex-shrink-0">
        Staff Broadcasts
      </h2>
      {broadcasts.length === 0 ? (
        <p className="text-gray-500">No active broadcasts at the moment.</p>
      ) : (
        <ul
          className="space-y-3 overflow-y-auto flex-grow pr-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          {broadcasts.map((broadcast) => (
            <li
              key={broadcast.id}
              className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded"
            >
              <p className="text-yellow-900 font-semibold">{broadcast.text}</p>
              <span className="text-xs text-yellow-700">
                {new Date(broadcast.time).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StaffFeed;
