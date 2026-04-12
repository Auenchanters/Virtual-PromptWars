import rateLimit from 'express-rate-limit';
import {
    READ_RATE_LIMIT_MAX,
    WRITE_RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
} from '../config/constants';

const sharedOptions = {
    windowMs: RATE_LIMIT_WINDOW_MS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.', status: 429 },
};

/**
 * Applied globally. Read-heavy GET endpoints only count toward this limiter.
 */
const readLimiter = rateLimit({
    ...sharedOptions,
    max: READ_RATE_LIMIT_MAX,
});

/**
 * Applied selectively to POST routes that touch Gemini or Firebase writes.
 * Lower ceiling keeps AI cost and broadcast spam in check.
 */
const writeLimiter = rateLimit({
    ...sharedOptions,
    max: WRITE_RATE_LIMIT_MAX,
});

export {
    readLimiter as rateLimiter,
    readLimiter,
    writeLimiter,
};
