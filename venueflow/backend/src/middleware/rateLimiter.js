const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter middleware to enforce 100 requests per 15 mins per IP.
 */
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests, please try again later.', status: 429 }
});

module.exports = { rateLimiter };
