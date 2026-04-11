const NodeCache = require('node-cache');
const { db } = require('../config/firebaseAdmin');
const { logger } = require('../utils/logger');
const {
    CACHE_TTL_SECONDS,
    COLLECTION_CROWD,
    COLLECTION_QUEUES,
    DENSITY_LOW,
    DENSITY_MEDIUM,
    DENSITY_HIGH,
} = require('../config/constants');

const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const FALLBACK_CROWD = [
    { section: '101', density: DENSITY_HIGH },
    { section: '102', density: DENSITY_MEDIUM },
    { section: '103', density: DENSITY_LOW },
    { section: '104', density: DENSITY_LOW },
];

const FALLBACK_QUEUES = [
    { id: 'gate-1', type: 'gate', waitTimeMinutes: 15 },
    { id: 'concessions-12', type: 'concessions', waitTimeMinutes: 5 },
    { id: 'restroom-west', type: 'restroom', waitTimeMinutes: 2 },
];

/**
 * Retrieves crowd heatmap data from Firestore.
 * Results are cached to reduce database reads and network latency.
 */
async function getCrowdData() {
    const cached = cache.get('crowd_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_CROWD).get();
        const crowdData = [];
        snapshot.forEach(doc => {
            crowdData.push({ id: doc.id, ...doc.data() });
        });

        const finalData = crowdData.length > 0 ? crowdData : FALLBACK_CROWD;
        cache.set('crowd_data', finalData);
        return finalData;
    } catch (err) {
        logger.error('Error fetching crowd data', { error: err.message });
        throw err;
    }
}

/**
 * Retrieves queue wait times from Firestore.
 */
async function getQueueData() {
    const cached = cache.get('queue_data');
    if (cached) return cached;

    try {
        const snapshot = await db.collection(COLLECTION_QUEUES).get();
        const queueData = [];
        snapshot.forEach(doc => {
            queueData.push({ id: doc.id, ...doc.data() });
        });

        const finalData = queueData.length > 0 ? queueData : FALLBACK_QUEUES;
        cache.set('queue_data', finalData);
        return finalData;
    } catch (err) {
        logger.error('Error fetching queue data', { error: err.message });
        throw err;
    }
}

module.exports = { getCrowdData, getQueueData };
