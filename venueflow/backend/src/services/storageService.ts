import { admin } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';
import type { CrowdSection } from '../types';

/**
 * Lazily initialised Google Cloud Storage bucket reference.
 * Uses `admin.storage()` from the already-installed `firebase-admin` SDK.
 *
 * Google Services: Google Cloud Storage
 */
function getBucket() {
    return admin.storage().bucket(
        process.env.GCS_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'virtual-promptwars'}.appspot.com`,
    );
}

/**
 * Exports a crowd density snapshot to Google Cloud Storage for
 * historical analytics and post-event trend analysis.
 *
 * Runs fire-and-forget after each /api/crowd response so it never
 * blocks the attendee-facing path. If Cloud Storage is unavailable
 * the error is logged and swallowed.
 *
 * @param data - Current crowd section density readings
 */
export async function exportAnalyticsSnapshot(data: CrowdSection[]): Promise<void> {
    try {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `analytics/crowd-${ts}.json`;
        const file = getBucket().file(filename);
        await file.save(
            JSON.stringify({ timestamp: new Date().toISOString(), sections: data }),
            { contentType: 'application/json' },
        );
        logger.info('Analytics snapshot exported to Cloud Storage', { filename, sections: data.length });
    } catch (err: unknown) {
        logger.warn('Cloud Storage export failed (non-blocking)', {
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
