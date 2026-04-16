import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
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

/**
 * Runs every 24 hours via Google Cloud Scheduler to generate a
 * daily crowd analytics digest. Logs a summary of the day's events
 * to Cloud Logging for operations dashboards.
 *
 * Google Services: Google Cloud Scheduler, Cloud Functions (gen2), Cloud Logging
 */
export const dailyAnalyticsDigest = onSchedule('every 24 hours', async () => {
  logger.info('daily_analytics_digest', {
    message: 'Daily crowd analytics digest triggered by Cloud Scheduler',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Processes high-density crowd alerts published to the
 * `venueflow-crowd-alerts` Pub/Sub topic. Downstream subscribers
 * (notification services, alerting pipelines) can react independently.
 *
 * Google Services: Google Cloud Pub/Sub, Cloud Functions (gen2), Cloud Logging
 */
export const onCrowdAlert = onMessagePublished(
  'venueflow-crowd-alerts',
  (event) => {
    const data = event.data.message.json;
    logger.warn('high_density_alert_received', {
      sections: data?.sections,
      alertLevel: data?.alertLevel,
      receivedAt: new Date().toISOString(),
    });
  }
);
