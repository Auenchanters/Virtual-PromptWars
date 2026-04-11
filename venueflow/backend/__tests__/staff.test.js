process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const request = require('supertest');

jest.mock('../src/services/realtimeService', () => ({
    broadcastMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([{ section: '101', density: 'HIGH' }]),
    getQueueData: jest.fn().mockResolvedValue([{ id: 'gate-1', type: 'gate', waitTimeMinutes: 10 }]),
}));

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked reply'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked itinerary'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Mocked summary'),
    generateCrowdForecast: jest.fn().mockResolvedValue('Mocked forecast'),
}));

const app = require('../src/app');

const VALID_BODY = { announcement: 'Gate 7 is now open for entry' };
const STAFF_KEY = { 'X-Staff-Key': 'test-staff-key' };

describe('Staff Broadcast API', () => {
    it('returns 201 when key and body are valid', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set(STAFF_KEY)
            .send(VALID_BODY);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
    });

    it('returns 401 when X-Staff-Key header is missing', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send(VALID_BODY);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/staff/i);
    });

    it('returns 401 when X-Staff-Key is incorrect', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set({ 'X-Staff-Key': 'wrong-key' })
            .send(VALID_BODY);
        expect(response.status).toBe(401);
    });

    it('returns 400 when announcement is missing', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set(STAFF_KEY)
            .send({});
        expect(response.status).toBe(400);
    });

    it('returns 400 when announcement is empty string', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set(STAFF_KEY)
            .send({ announcement: '' });
        expect(response.status).toBe(400);
    });

    it('returns 400 when announcement is not a string', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set(STAFF_KEY)
            .send({ announcement: 99 });
        expect(response.status).toBe(400);
    });

    it('returns 400 when announcement exceeds max length', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .set(STAFF_KEY)
            .send({ announcement: 'x'.repeat(1001) });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/1000/);
    });
});
