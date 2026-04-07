import { useState, useEffect } from 'react';
import { fetchCrowdData, fetchQueueData } from '../services/api';

export type CrowdDensity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CrowdSection {
  section: string;
  density: CrowdDensity;
}

export interface QueueItem {
  id: string;
  type: string;
  waitTimeMinutes: number;
}

export function useCrowdData() {
  const [crowd, setCrowd] = useState<CrowdSection[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [crowdRes, queueRes] = await Promise.all([
          fetchCrowdData(),
          fetchQueueData()
        ]);
        if (active) {
          setCrowd(crowdRes);
          setQueues(queueRes);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000); // refresh every 30s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { crowd, queues, loading };
}
