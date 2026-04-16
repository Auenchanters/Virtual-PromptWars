import { logger } from '../utils/logger';

/**
 * Structured analytics event logger optimised for Google Cloud Logging.
 *
 * Cloud Run captures every stdout/stderr line as a Cloud Logging entry.
 * This service adds the `logging.googleapis.com/labels` envelope so that
 * entries are automatically filterable in the Cloud Logging console by
 * service name and event type.
 *
 * Google Services: Google Cloud Logging
 */

/**
 * Emits a structured analytics event to Google Cloud Logging.
 *
 * @param eventName - Machine-readable event identifier (e.g. 'crowd_snapshot_exported')
 * @param payload   - Arbitrary key-value metadata attached to the log entry
 */
export function logAnalyticsEvent(eventName: string, payload: Record<string, unknown>): void {
    logger.info(eventName, {
        ...payload,
        'logging.googleapis.com/labels': { service: 'venueflow-backend' },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emits a structured warning event for operational alerting.
 *
 * @param eventName - Machine-readable event identifier
 * @param payload   - Arbitrary key-value metadata
 */
export function logWarningEvent(eventName: string, payload: Record<string, unknown>): void {
    logger.warn(eventName, {
        ...payload,
        'logging.googleapis.com/labels': { service: 'venueflow-backend' },
        timestamp: new Date().toISOString(),
    });
}
