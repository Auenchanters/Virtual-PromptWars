import { useState, useEffect } from 'react';
import { fetchCrowdData, fetchQueueData } from '../services/api';
import { CrowdSection, QueueItem, CrowdDensity } from '../types';
import { REFRESH_INTERVAL_MS } from '../utils/constants';

export type { CrowdSection, QueueItem, CrowdDensity };

export function useCrowdData() {
  const [crowd, setCrowd] = useState<CrowdSection[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [crowdRes, queueRes] = await Promise.all([
          fetchCrowdData(),
          fetchQueueData(),
        ]);
        if (active) {
          setCrowd(crowdRes);
          setQueues(queueRes);
          setError(null);
        }
      } catch {
        if (active) setError('Unable to load live venue data. Retrying shortly.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { crowd, queues, loading, error };
}
