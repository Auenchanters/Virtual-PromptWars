const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked AI Response'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked itinerary'),
}));

describe('Gemini API', () => {
    it('POST /api/gemini/chat returns 200 with AI response when given valid message', async () => {
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

    it('POST /api/gemini/itinerary returns 200 with itinerary string when section is provided', async () => {
        const response = await request(app)
            .post('/api/gemini/itinerary')
            .send({ section: '112' });
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('itinerary', 'Mocked itinerary');
    });
    
    it('POST /api/staff/broadcast returns 201 when given valid announcement', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send({ announcement: 'Hello World' });
            
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
    });
});
