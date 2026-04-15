import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';

/**
 * Guards the staff broadcast endpoint. Accepts either:
 *
 *   1. `Authorization: Bearer <Firebase ID token>` — verified via Firebase
 *      Admin SDK and required to carry a `staff: true` custom claim. This is
 *      the production-grade path and gives per-staff-user audit trails.
 *
 *   2. `X-Staff-Key: <shared secret>` — a constant-time comparison of a
 *      shared secret, kept as a fallback for the hackathon demo surface
 *      where distributing Firebase accounts per volunteer is impractical.
 *
 * Either credential satisfies the middleware. If neither is present the
 * request is rejected with 401. If the server is not configured with any
 * credential source it fails closed with 503.
 */
async function requireStaffKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    const bearer = extractBearerToken(req);
    if (bearer) {
        try {
            const decoded = await admin.auth().verifyIdToken(bearer);
            if (decoded.staff === true || decoded.role === 'staff') {
                (req as Request & { staffUid?: string }).staffUid = decoded.uid;
                next();
                return;
            }
            logger.warn('Rejected staff broadcast — missing staff claim', {
                requestId: req.id,
                uid: decoded.uid,
            });
            res.status(403).json({
                error: 'Staff role required.',
                status: 403,
                requestId: req.id,
            });
            return;
        } catch (err: unknown) {
            logger.warn('Rejected staff broadcast — invalid ID token', {
                requestId: req.id,
                error: err instanceof Error ? err.message : String(err),
            });
            // Fall through to shared-key path so an expired token does not
            // permanently lock out demo operators who also hold the shared secret.
        }
    }

    const expected = process.env.STAFF_API_KEY;
    if (!expected) {
        logger.error('STAFF_API_KEY not configured', { requestId: req.id });
        res.status(503).json({
            error: 'Staff authentication is not configured on the server.',
            status: 503,
            requestId: req.id,
        });
        return;
    }

    const provided = req.headers['x-staff-key'];
    if (typeof provided !== 'string' || provided.length === 0) {
        res.status(401).json({
            error: 'Missing staff credentials.',
            status: 401,
            requestId: req.id,
        });
        return;
    }

    const expectedBuf = Buffer.from(expected);
    const providedBuf = Buffer.from(provided);
    if (
        providedBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
        logger.warn('Rejected staff broadcast attempt', {
            requestId: req.id,
            ip: req.ip,
        });
        res.status(401).json({
            error: 'Invalid staff credentials.',
            status: 401,
            requestId: req.id,
        });
        return;
    }

    next();
}

function extractBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (typeof header !== 'string') return null;
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match?.[1] ?? null;
}

export { requireStaffKey };
