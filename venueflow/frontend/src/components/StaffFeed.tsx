import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '../services/firebase';

interface Broadcast {
  id: string;
  text: string;
  time: number;
}

const StaffFeed: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    let isMounted = true;
    const broadcastsRef = ref(rtdb, 'announcements');
    
    // Listen to Firebase Realtime Database
    onValue(broadcastsRef, (snapshot) => {
      if (!isMounted) return;
      const data = snapshot.val();
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          text: val.text,
          time: val.time
        })).sort((a, b) => b.time - a.time).slice(0, 50); // Keep last 50 broadcasts
        setBroadcasts(items);
      } else {
        setBroadcasts([]);
      }
    }, (error) => {
      console.error("Firebase Auth/Permission Error:", error);
    });

    return () => {
      isMounted = false;
      off(broadcastsRef);
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow-sm h-full max-h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Staff Broadcasts</h2>
      {broadcasts.length === 0 ? (
        <p className="text-gray-500">No active broadcasts at the moment.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto flex-grow pr-2">
          {broadcasts.map(b => (
            <li key={b.id} className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <p className="text-yellow-800 font-semibold">{b.text}</p>
              <span className="text-xs text-yellow-600">{new Date(b.time).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffFeed;
