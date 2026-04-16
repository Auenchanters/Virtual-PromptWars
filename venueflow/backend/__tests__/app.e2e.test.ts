process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

import request from 'supertest';

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Hello from AI'),
    generateItinerary: jest.fn().mockResolvedValue('Your itinerary'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Summary'),
    generateCrowdForecast: jest.fn().mockResolvedValue('Forecast'),
}));

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([
        { section: '101', density: 'HIGH' },
        { section: '102', density: 'LOW' },
    ]),
    getQueueData: jest.fn().mockResolvedValue([
        { id: 'gate-1', type: 'gate', waitTimeMinutes: 10 },
    ]),
}));

jest.mock('../src/services/realtimeService', () => ({
    broadcastMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/storageService', () => ({
    exportAnalyticsSnapshot: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/loggingService', () => ({
    logAnalyticsEvent: jest.fn(),
    logWarningEvent: jest.fn(),
}));

import app from '../src/app';

describe('E2E: GET /health', () => {
    it('returns 200 with healthy status and timestamp', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
        expect(response.body.timestamp).toBeDefined();
    });
});

describe('E2E: GET /api/crowd', () => {
    it('returns 200 with crowd data array', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('section', '101');
    });
});

describe('E2E: POST /api/gemini/chat', () => {
    it('returns 200 for valid message', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 'Hello' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reply', 'Hello from AI');
    });

    it('returns 400 for empty body', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('requestId');
    });

    it('returns 400 for invalid Zod payload (non-string)', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: ['not', 'a', 'string'] });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/string/i);
    });

    it('sanitizes XSS in message before processing', async () => {
        const { chatWithGemini } = require('../src/services/geminiService');
        (chatWithGemini as jest.Mock).mockClear();

        await request(app)
            .post('/api/gemini/chat')
            .send({ message: '<script>alert(1)</script>Hello' });

        const calledWith = (chatWithGemini as jest.Mock).mock.calls[0][0];
        expect(calledWith).not.toContain('<script>');
        expect(calledWith).toContain('Hello');
    });
});
