const { rtdb } = require('../config/firebaseAdmin');

/**
 * Broadcasts a message to the Firebase Realtime Database.
 * @param {string} announcement - The text to broadcast.
 * @returns {Promise<void>}
 */
async function broadcastMessage(announcement) {
    if (!announcement) throw new Error('Announcement required.');
    
    try {
        const announcementsRef = rtdb.ref('announcements');
        await announcementsRef.push({
            text: announcement,
            time: Date.now()
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error broadcasting message to RTDB:', err);
        throw err;
    }
}

module.exports = { broadcastMessage };
