const crypto = require('crypto');

/**
 * Assigns a unique request id to every incoming request so that logs
 * and error responses can be correlated when debugging production issues.
 */
function requestId(req, res, next) {
    const incoming = req.headers['x-request-id'];
    const id = (typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128)
        ? incoming
        : crypto.randomUUID();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
}

module.exports = { requestId };
