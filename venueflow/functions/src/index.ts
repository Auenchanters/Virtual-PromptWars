import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

/**
 * Fires whenever a crowd section document is created or updated in Firestore.
 * Emits a structured analytics event to Google Cloud Logging so operators
 * can query density-change frequency in Cloud Logging / Log Analytics.
 *
 * Google Services: Firebase Cloud Functions (gen2), Google Cloud Logging
 */
export const onCrowdSectionUpdate = onDocumentWritten(
  'crowd/{sectionId}',
  (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    logger.info('crowd_density_changed', {
      sectionId: event.params.sectionId,
      density: after.density as string,
      section: after.section as string,
      updatedAt: new Date().toISOString(),
    });
  }
);

/**
 * Fires whenever a staff announcement document is written to Firestore.
 * Emits a structured audit-trail log entry to Google Cloud Logging.
 *
 * Google Services: Firebase Cloud Functions (gen2), Google Cloud Logging
 */
export const onStaffAnnouncementWritten = onDocumentWritten(
  'announcements/{announcementId}',
  (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    logger.info('staff_announcement_broadcast', {
      announcementId: event.params.announcementId,
      message: after.message as string,
      broadcastAt: new Date().toISOString(),
    });
  }
);
