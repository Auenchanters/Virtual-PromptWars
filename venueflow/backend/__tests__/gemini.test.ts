process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

import request from 'supertest';

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked AI Response'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked itinerary for section 112'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Crowd is moderate today'),
    generateCrowdForecast: jest.fn().mockResolvedValue('Mocked forecast'),
}));

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([{ section: '101', density: 'HIGH' }]),
    getQueueData: jest.fn().mockResolvedValue([{ id: 'gate-1', type: 'gate', waitTimeMinutes: 10 }]),
}));

jest.mock('../src/services/storageService', () => ({
    exportAnalyticsSnapshot: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/loggingService', () => ({
    logAnalyticsEvent: jest.fn(),
    logWarningEvent: jest.fn(),
}));

import app from '../src/app';
import { chatWithGemini, generateItinerary } from '../src/services/geminiService';

describe('POST /api/gemini/chat', () => {
    it('returns 200 with AI reply for valid message', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 'Where is the nearest restroom?' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reply', 'Mocked AI Response');
    });

    it('returns 400 when message field is missing', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({});
        expect(response.status).toBe(400);
    });

    it('returns 400 when message is empty string', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: '' });
        expect(response.status).toBe(400);
    });

    it('returns 400 when message is not a string', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 12345 });
        expect(response.status).toBe(400);
    });

    it('returns 400 when message exceeds 500 characters', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 'x'.repeat(501) });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/500/);
    });
});

describe('POST /api/gemini/itinerary', () => {
    it('returns 200 with itinerary for valid section', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '112' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('itinerary');
    });

    it('returns 400 when section is missing', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({});
        expect(response.status).toBe(400);
    });

    it('returns 400 when section is empty string', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '' });
        expect(response.status).toBe(400);
    });

    it('returns 400 when section exceeds 16 characters', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: 'x'.repeat(17) });
        expect(response.status).toBe(400);
    });

    it('returns 500 when gemini itinerary service throws', async () => {
        (generateItinerary as jest.Mock).mockRejectedValueOnce(new Error('Gemini down'));
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '999' });
        expect(response.status).toBe(500);
    });
});

describe('POST /api/gemini/chat error handling', () => {
    it('returns 500 when gemini chat service throws', async () => {
        (chatWithGemini as jest.Mock).mockRejectedValueOnce(new Error('Gemini down'));
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 'trigger error' });
        expect(response.status).toBe(500);
    });
});
