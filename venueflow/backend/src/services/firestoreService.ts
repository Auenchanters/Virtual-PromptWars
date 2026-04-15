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
import { CrowdSectionSchema, QueueItemSchema } from '../schemas/firestore';

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
 * Retrieves crowd heatmap data from Firestore. Every document is validated
 * through `CrowdSectionSchema` at the read boundary; malformed rows are
 * dropped rather than cast blindly. Falls back to deterministic demo data
 * if the collection is empty so the UI never shows a stale or broken state.
 *
 * @throws When the underlying Firestore fetch fails.
 */
async function getCrowdData(): Promise<CrowdSection[]> {
    const cached = cache.get<CrowdSection[]>('crowd_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_CROWD).get();
        const crowdData: CrowdSection[] = [];
        snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const parsed = CrowdSectionSchema.safeParse({ id: doc.id, ...doc.data() });
            if (parsed.success) {
                crowdData.push(parsed.data);
            } else {
                logger.warn('Rejected malformed crowd document', {
                    id: doc.id,
                    issues: parsed.error.issues.map((i) => i.message),
                });
            }
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
 * Retrieves queue wait times from Firestore with runtime validation.
 * Malformed rows are dropped and logged; empty results fall back to demo data.
 *
 * @throws When the underlying Firestore fetch fails.
 */
async function getQueueData(): Promise<QueueItem[]> {
    const cached = cache.get<QueueItem[]>('queue_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_QUEUES).get();
        const queueData: QueueItem[] = [];
        snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const parsed = QueueItemSchema.safeParse({ id: doc.id, ...doc.data() });
            if (parsed.success) {
                queueData.push(parsed.data);
            } else {
                logger.warn('Rejected malformed queue document', {
                    id: doc.id,
                    issues: parsed.error.issues.map((i) => i.message),
                });
            }
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
