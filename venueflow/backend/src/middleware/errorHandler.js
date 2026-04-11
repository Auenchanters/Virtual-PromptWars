const { logger } = require('../utils/logger');

/**
 * Global error handling middleware. Returns a sanitized JSON envelope
 * and never leaks stack traces to the client; full error is logged server-side.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    logger.error('Unhandled error', {
        requestId: req.id,
        path: req.originalUrl,
        method: req.method,
        status,
        error: err.message,
    });
    res.status(status).json({
        error: status >= 500 ? 'Internal Server Error' : err.message,
        status,
        requestId: req.id,
    });
};

module.exports = { errorHandler };
