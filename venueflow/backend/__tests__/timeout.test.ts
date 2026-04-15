import express, { Request, Response } from 'express';
import request from 'supertest';
import { requestTimeout } from '../src/middleware/timeout';
import { requestId } from '../src/middleware/requestId';

function buildAppWithTimeout(ms: number, handlerDelay: number) {
    const app = express();
    app.use(requestId);
    app.use(requestTimeout(ms));
    app.get('/slow', (_req: Request, res: Response) => {
        setTimeout(() => {
            if (!res.headersSent) res.status(200).json({ ok: true });
        }, handlerDelay);
    });
    app.get('/fast', (_req: Request, res: Response) => res.status(200).json({ ok: true }));
    return app;
}

describe('requestTimeout middleware', () => {
    it('passes through fast requests untouched', async () => {
        const app = buildAppWithTimeout(500, 0);
        const response = await request(app).get('/fast');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ok: true });
    });

    it('returns a 503 envelope when the handler exceeds the timeout', async () => {
        const app = buildAppWithTimeout(50, 200);
        const response = await request(app).get('/slow');
        expect(response.status).toBe(503);
        expect(response.body).toMatchObject({ status: 503 });
        expect(response.body.error).toMatch(/timed out/i);
        expect(response.body.requestId).toBeDefined();
    });
});
