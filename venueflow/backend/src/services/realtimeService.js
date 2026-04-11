const { rtdb } = require('../config/firebaseAdmin');
const { logger } = require('../utils/logger');
const { RTDB_ANNOUNCEMENTS } = require('../config/constants');

/**
 * Broadcasts an announcement to the Firebase Realtime Database so that
 * every connected attendee client can pick it up instantly.
 */
async function broadcastMessage(announcement) {
    if (!announcement) throw new Error('Announcement required.');

    try {
        const announcementsRef = rtdb.ref(RTDB_ANNOUNCEMENTS);
        await announcementsRef.push({
            text: announcement,
            time: Date.now(),
        });
    } catch (err) {
        logger.error('Error broadcasting message to RTDB', { error: err.message });
        throw err;
    }
}

module.exports = { broadcastMessage };
