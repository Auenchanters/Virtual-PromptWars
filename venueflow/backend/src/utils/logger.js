/**
 * Tiny structured JSON logger. Emits one line of JSON per log call so
 * Cloud Logging parses level, message, requestId, and meta automatically.
 * No external dependency; wraps console.info/warn/error.
 */

const LEVELS = ['debug', 'info', 'warn', 'error'];

function buildPayload(level, message, meta) {
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        message,
    };
    if (meta && typeof meta === 'object') {
        const rest = {};
        for (const key of Object.keys(meta)) {
            if (key === 'requestId') {
                payload.requestId = meta.requestId;
            } else {
                rest[key] = meta[key];
            }
        }
        if (Object.keys(rest).length > 0) {
            payload.meta = rest;
        }
    }
    return payload;
}

function emit(level, message, meta) {
    const line = JSON.stringify(buildPayload(level, message, meta));
    // eslint-disable-next-line no-console
    if (level === 'error') {
        console.error(line);
    // eslint-disable-next-line no-console
    } else if (level === 'warn') {
        console.warn(line);
    } else {
        // eslint-disable-next-line no-console
        console.info(line);
    }
}

const logger = LEVELS.reduce((acc, level) => {
    acc[level] = (message, meta) => emit(level, message, meta);
    return acc;
}, {});

module.exports = { logger };
