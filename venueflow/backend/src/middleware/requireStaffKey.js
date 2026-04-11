const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Guards the staff broadcast endpoint with a shared `X-Staff-Key` header.
 * Comparison uses `crypto.timingSafeEqual` so an attacker cannot probe the
 * key one byte at a time. In production this would be replaced by Firebase
 * Auth ID-token verification, but the shared-secret model is intentionally
 * small for the hackathon deployment.
 */
function requireStaffKey(req, res, next) {
    const expected = process.env.STAFF_API_KEY;
    if (!expected) {
        logger.error('STAFF_API_KEY not configured', { requestId: req.id });
        return res.status(503).json({
            error: 'Staff authentication is not configured on the server.',
            status: 503,
            requestId: req.id,
        });
    }

    const provided = req.headers['x-staff-key'];
    if (typeof provided !== 'string' || provided.length === 0) {
        return res.status(401).json({
            error: 'Missing staff credentials.',
            status: 401,
            requestId: req.id,
        });
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
        return res.status(401).json({
            error: 'Invalid staff credentials.',
            status: 401,
            requestId: req.id,
        });
    }

    return next();
}

module.exports = { requireStaffKey };
