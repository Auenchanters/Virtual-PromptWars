/**
 * Centralized constants for the VenueFlow backend.
 * Extracted to eliminate magic numbers/strings and keep tunable
 * values in one place.
 */

module.exports = {
    CACHE_TTL_SECONDS: 30,
    FORECAST_CACHE_TTL_SECONDS: 60,

    MAX_MESSAGE_LENGTH: 500,
    MAX_SECTION_LENGTH: 16,
    MAX_ANNOUNCEMENT_LENGTH: 1000,

    BROADCAST_HISTORY_LIMIT: 50,

    READ_RATE_LIMIT_MAX: 100,
    WRITE_RATE_LIMIT_MAX: 20,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,

    REQUEST_BODY_LIMIT: '10kb',

    COLLECTION_CROWD: 'crowd',
    COLLECTION_QUEUES: 'queues',
    RTDB_ANNOUNCEMENTS: 'announcements',

    DENSITY_LOW: 'LOW',
    DENSITY_MEDIUM: 'MEDIUM',
    DENSITY_HIGH: 'HIGH',
};
