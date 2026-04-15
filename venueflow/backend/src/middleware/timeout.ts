import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Fails any request that hasn't flushed response headers within `ms`
 * with a 503 envelope that matches the shape produced by `errorHandler`.
 *
 * Long-running Gemini calls are the primary reason we need this — without
 * it a stalled upstream can hold a Cloud Run request slot indefinitely.
 */
function requestTimeout(ms: number) {
    return function timeoutMiddleware(req: Request, res: Response, next: NextFunction): void {
        const timer = setTimeout(() => {
            if (res.headersSent) return;
            logger.warn('Request exceeded timeout', {
                requestId: req.id,
                path: req.originalUrl,
                method: req.method,
                timeoutMs: ms,
            });
            res.status(503).json({
                error: 'Request timed out. Please try again.',
                status: 503,
                requestId: req.id,
            });
        }, ms);

        res.on('finish', () => clearTimeout(timer));
        res.on('close', () => clearTimeout(timer));
        next();
    };
}

export { requestTimeout };
