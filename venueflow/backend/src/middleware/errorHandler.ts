import { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware. Returns a sanitized JSON envelope
 * and never leaks stack traces to the client; full error is logged server-side.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const status = err.status || 500;
    logger.error('Unhandled error', {
        requestId: req.id,
        path: req.originalUrl,
        method: req.method,
        status,
        error: err.message,
    });
    const body: Record<string, unknown> = {
        error: status >= 500 ? 'Internal Server Error' : err.message,
        status,
        requestId: req.id,
    };
    // Expose stack traces in local development only to aid debugging.
    if (process.env.NODE_ENV === 'development' && err.stack) {
        body.stack = err.stack;
    }
    res.status(status).json(body);
};

export { errorHandler };
