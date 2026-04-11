const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');

function buildAppWithTightLimiter() {
    const app = express();
    const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests', status: 429 },
    });
    app.use(limiter);
    app.get('/ping', (req, res) => res.status(200).json({ ok: true }));
    return app;
}

describe('rate limiter behavior', () => {
    it('allows up to the configured max and then returns 429', async () => {
        const app = buildAppWithTightLimiter();
        const r1 = await request(app).get('/ping');
        const r2 = await request(app).get('/ping');
        const r3 = await request(app).get('/ping');
        const r4 = await request(app).get('/ping');
        expect(r1.status).toBe(200);
        expect(r2.status).toBe(200);
        expect(r3.status).toBe(200);
        expect(r4.status).toBe(429);
    });
});
