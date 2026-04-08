const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked AI Response'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked itinerary for section 112'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Crowd is moderate today'),
}));

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([{ section: '101', density: 'HIGH' }]),
    getQueueData: jest.fn().mockResolvedValue([{ id: 'gate-1', type: 'gate', waitTimeMinutes: 10 }]),
}));

describe('Gemini Chat API', () => {
    it('POST /api/gemini/chat returns 200 with AI reply for valid message', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 'Where is the nearest restroom?' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reply', 'Mocked AI Response');
    });

    it('POST /api/gemini/chat returns 400 when message field is missing', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('POST /api/gemini/chat returns 400 when message is empty string', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: '' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('POST /api/gemini/chat returns 400 when message is not a string', async () => {
        const response = await request(app)
            .post('/api/gemini/chat')
            .send({ message: 12345 });
        expect(response.status).toBe(400);
    });
});

describe('Gemini Itinerary API', () => {
    it('POST /api/gemini/itinerary returns 200 with itinerary for valid section', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '112' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('itinerary');
    });

    it('POST /api/gemini/itinerary returns 400 when section is missing', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('POST /api/gemini/itinerary returns 400 when section is empty string', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '' });
        expect(response.status).toBe(400);
    });
});
