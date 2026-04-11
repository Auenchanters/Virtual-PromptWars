process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const request = require('supertest');

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([{ section: '101', density: 'HIGH' }]),
    getQueueData: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('ok'),
    generateItinerary: jest.fn().mockResolvedValue('ok'),
    generateCrowdSummary: jest.fn().mockResolvedValue('ok'),
    generateCrowdForecast: jest.fn().mockResolvedValue('ok'),
}));

jest.mock('../src/services/realtimeService', () => ({
    broadcastMessage: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../src/app');

describe('Security hardening', () => {
    it('sets strict-transport-security, content-type-options and referrer-policy headers', async () => {
        const response = await request(app).get('/health');
        expect(response.headers['strict-transport-security']).toBeDefined();
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('does not leak x-powered-by', async () => {
        const response = await request(app).get('/health');
        expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('echoes X-Request-Id on every response', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.headers['x-request-id']).toMatch(/.+/);
    });

    it('rejects POST with non-JSON content type with 415', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .set('Content-Type', 'text/plain')
            .send('not json');
        expect(response.status).toBe(415);
    });

    it('returns 413 when body exceeds 10kb limit', async () => {
        const huge = 'x'.repeat(11 * 1024);
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: huge });
        expect([400, 413]).toContain(response.status);
    });

    it('accepts custom incoming X-Request-Id and echoes it back', async () => {
        const response = await request(app)
            .get('/health')
            .set('X-Request-Id', 'custom-trace-123');
        expect(response.headers['x-request-id']).toBe('custom-trace-123');
    });
});
