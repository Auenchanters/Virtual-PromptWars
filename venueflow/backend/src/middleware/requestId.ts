import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

/**
 * Assigns a unique request id to every incoming request so that logs
 * and error responses can be correlated when debugging production issues.
 */
function requestId(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-request-id'];
    const id = (typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128)
        ? incoming
        : crypto.randomUUID();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
}

export { requestId };
