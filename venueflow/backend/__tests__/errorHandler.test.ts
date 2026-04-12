import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler';
import { requestId } from '../src/middleware/requestId';

function buildTestApp() {
    const app = express();
    app.use(requestId);
    app.get('/boom', () => {
        throw new Error('synthetic failure');
    });
    app.get('/client-error', (req: Request, res: Response, next: NextFunction) => {
        const err = new Error('bad request') as Error & { status: number };
        err.status = 400;
        next(err);
    });
    app.use(errorHandler);
    return app;
}

describe('errorHandler middleware', () => {
    const app = buildTestApp();

    it('returns 500 JSON envelope for uncaught errors without leaking the message', async () => {
        const response = await request(app).get('/boom');
        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                error: 'Internal Server Error',
                status: 500,
                requestId: expect.any(String),
            })
        );
        expect(JSON.stringify(response.body)).not.toContain('synthetic failure');
    });

    it('passes through client-friendly message for 4xx errors', async () => {
        const response = await request(app).get('/client-error');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('bad request');
        expect(response.body.status).toBe(400);
    });
});
