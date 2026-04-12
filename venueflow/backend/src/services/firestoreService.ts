import NodeCache from 'node-cache';
import { db } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';
import {
    CACHE_TTL_SECONDS,
    COLLECTION_CROWD,
    COLLECTION_QUEUES,
    DENSITY_LOW,
    DENSITY_MEDIUM,
    DENSITY_HIGH,
} from '../config/constants';
import { CrowdSection, QueueItem } from '../types';

const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const FALLBACK_CROWD: CrowdSection[] = [
    { id: '101', section: '101', density: DENSITY_HIGH },
    { id: '102', section: '102', density: DENSITY_MEDIUM },
    { id: '103', section: '103', density: DENSITY_LOW },
    { id: '104', section: '104', density: DENSITY_LOW },
];

const FALLBACK_QUEUES: QueueItem[] = [
    { id: 'gate-1', type: 'gate', waitTimeMinutes: 15 },
    { id: 'concessions-12', type: 'concessions', waitTimeMinutes: 5 },
    { id: 'restroom-west', type: 'restroom', waitTimeMinutes: 2 },
];

/**
 * Retrieves crowd heatmap data from Firestore.
 * Results are cached to reduce database reads and network latency.
 * @returns {Promise<object[]>} Array of crowd density objects with section and density fields
 */
async function getCrowdData(): Promise<CrowdSection[]> {
    const cached = cache.get<CrowdSection[]>('crowd_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_CROWD).get();
        const crowdData: CrowdSection[] = [];
        snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            crowdData.push({ id: doc.id, ...doc.data() } as CrowdSection);
        });

        const finalData = crowdData.length > 0 ? crowdData : FALLBACK_CROWD;
        cache.set('crowd_data', finalData);
        return finalData;
    } catch (err: unknown) {
        logger.error('Error fetching crowd data', { error: (err instanceof Error ? err.message : String(err)) });
        throw err;
    }
}

/**
 * Retrieves queue wait times from Firestore.
 * @returns {Promise<object[]>} Array of queue wait time objects with type and waitTimeMinutes fields
 */
async function getQueueData(): Promise<QueueItem[]> {
    const cached = cache.get<QueueItem[]>('queue_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_QUEUES).get();
        const queueData: QueueItem[] = [];
        snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            queueData.push({ id: doc.id, ...doc.data() } as QueueItem);
        });

        const finalData = queueData.length > 0 ? queueData : FALLBACK_QUEUES;
        cache.set('queue_data', finalData);
        return finalData;
    } catch (err: unknown) {
        logger.error('Error fetching queue data', { error: (err instanceof Error ? err.message : String(err)) });
        throw err;
    }
}

export { getCrowdData, getQueueData };
