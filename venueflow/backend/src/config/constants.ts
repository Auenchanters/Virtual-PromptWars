/**
 * Centralized constants for the VenueFlow backend.
 * Extracted to eliminate magic numbers/strings and keep tunable
 * values in one place.
 */

export const CACHE_TTL_SECONDS = 30;
export const FORECAST_CACHE_TTL_SECONDS = 60;

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_SECTION_LENGTH = 16;
export const MAX_ANNOUNCEMENT_LENGTH = 1000;

export const BROADCAST_HISTORY_LIMIT = 50;

export const READ_RATE_LIMIT_MAX = 100;
export const WRITE_RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const REQUEST_BODY_LIMIT = '10kb';

export const COLLECTION_CROWD = 'crowd';
export const COLLECTION_QUEUES = 'queues';
export const RTDB_ANNOUNCEMENTS = 'announcements';

export const DENSITY_LOW = 'LOW' as const;
export const DENSITY_MEDIUM = 'MEDIUM' as const;
export const DENSITY_HIGH = 'HIGH' as const;
