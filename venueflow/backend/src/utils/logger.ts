/**
 * Tiny structured JSON logger. Emits one line of JSON per log call so
 * Cloud Logging parses level, message, requestId, and meta automatically.
 * No external dependency; wraps console.info/warn/error.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function buildPayload(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const payload: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        level,
        message,
    };
    if (meta && typeof meta === 'object') {
        const rest: Record<string, unknown> = {};
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

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
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

export const logger = {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
