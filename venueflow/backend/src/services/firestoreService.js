const NodeCache = require('node-cache');
const { db } = require('../config/firebaseAdmin');

const cache = new NodeCache({ stdTTL: 30 }); // 30 second TTL

/**
 * Retrieves crowd heatmap data from Firestore.
 * Results are cached for 30s to reduce DB reads.
 * @returns {Promise<Array<{section: string, density: string}>>} Array of crowd sections.
 */
async function getCrowdData() {
    const cached = cache.get('crowd_data');
    if (cached) return cached;
    
    try {
        const snapshot = await db.collection('crowd').get();
        const crowdData = [];
        snapshot.forEach(doc => {
            crowdData.push({ id: doc.id, ...doc.data() });
        });

        // Fallback data structure if database is empty on clean start
        const finalData = crowdData.length > 0 ? crowdData : [
            { section: '101', density: 'HIGH' },
            { section: '102', density: 'MEDIUM' },
            { section: '103', density: 'LOW' },
            { section: '104', density: 'LOW' }
        ];

        cache.set('crowd_data', finalData);
        return finalData;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching crowd data:', err);
        throw err;
    }
}

/**
 * Retrieves queue wait times from Firestore.
 * @returns {Promise<Array<{id: string, type: string, waitTimeMinutes: number}>>} Array of queues.
 */
async function getQueueData() {
    const cached = cache.get('queue_data');
    if (cached) return cached;
    
    try {
        const snapshot = await db.collection('queues').get();
        const queueData = [];
        snapshot.forEach(doc => {
            queueData.push({ id: doc.id, ...doc.data() });
        });

         const finalData = queueData.length > 0 ? queueData : [
            { id: 'gate-1', type: 'gate', waitTimeMinutes: 15 },
            { id: 'concessions-12', type: 'concessions', waitTimeMinutes: 5 },
            { id: 'restroom-west', type: 'restroom', waitTimeMinutes: 2 }
        ];

        cache.set('queue_data', finalData);
        return finalData;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching queue data:', err);
        throw err;
    }
}

module.exports = { getCrowdData, getQueueData };
