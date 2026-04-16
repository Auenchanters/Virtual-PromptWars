process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

import request from 'supertest';

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([]),
    getQueueData: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/services/storageService', () => ({
    exportAnalyticsSnapshot: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/loggingService', () => ({
    logAnalyticsEvent: jest.fn(),
    logWarningEvent: jest.fn(),
}));

import app from '../src/app';

describe('GET /health', () => {
    it('returns 200 with healthy status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
    });

    it('returns a valid timestamp', async () => {
        const response = await request(app).get('/health');
        expect(response.body).toHaveProperty('timestamp');
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('responds with JSON content type', async () => {
        const response = await request(app).get('/health');
        expect(response.headers['content-type']).toMatch(/json/);
    });

    it('includes an X-Request-Id header', async () => {
        const response = await request(app).get('/health');
        const headerValue = response.headers['x-request-id'];
        expect(headerValue).toBeDefined();
        expect(typeof headerValue).toBe('string');
        expect((headerValue as string).length).toBeGreaterThan(0);
    });
});
