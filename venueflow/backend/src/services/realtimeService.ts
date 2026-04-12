import { rtdb } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';
import { RTDB_ANNOUNCEMENTS } from '../config/constants';

/**
 * Broadcasts an announcement to the Firebase Realtime Database so that
 * every connected attendee client can pick it up instantly.
 * @param {string} announcement - The announcement text to broadcast to all connected clients
 * @returns {Promise<void>} Resolves when the announcement has been pushed to RTDB
 */
async function broadcastMessage(announcement: string): Promise<void> {
    if (!announcement) throw new Error('Announcement required.');

    try {
        const announcementsRef = rtdb.ref(RTDB_ANNOUNCEMENTS);
        await announcementsRef.push({
            text: announcement,
            time: Date.now(),
        });
    } catch (err: unknown) {
        logger.error('Error broadcasting message to RTDB', { error: (err instanceof Error ? err.message : String(err)) });
        throw err;
    }
}

export { broadcastMessage };
