import { Request, Response, NextFunction } from 'express';

/**
 * Rejects POST/PUT/PATCH requests that do not declare a JSON content type.
 * This keeps Express from silently accepting form-encoded bodies and
 * ensures tooling and clients hit the same code path in tests and prod.
 */
function requireJson(req: Request, res: Response, next: NextFunction): void {
    const method = req.method;
    if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
        next();
        return;
    }
    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('application/json')) {
        res.status(415).json({
            error: 'Content-Type must be application/json',
            status: 415,
            requestId: req.id,
        });
        return;
    }
    next();
}

export { requireJson };
