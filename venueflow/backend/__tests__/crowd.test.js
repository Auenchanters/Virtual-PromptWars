process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const request = require('supertest');

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([
        { section: '101', density: 'HIGH' },
        { section: '102', density: 'MEDIUM' },
        { section: '103', density: 'LOW' },
    ]),
    getQueueData: jest.fn().mockResolvedValue([
        { id: 'gate-1', type: 'gate', waitTimeMinutes: 15 },
    ]),
}));

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Mocked'),
    generateCrowdForecast: jest.fn().mockResolvedValue('Expect moderate crowds; try section 103.'),
}));

const app = require('../src/app');

describe('Crowd API', () => {
    it('GET /api/crowd returns 200 with array of sections', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /api/crowd returns sections with density field', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.body[0]).toHaveProperty('section');
        expect(response.body[0]).toHaveProperty('density');
    });

    it('GET /api/crowd returns valid density values', async () => {
        const response = await request(app).get('/api/crowd');
        const valid = ['LOW', 'MEDIUM', 'HIGH'];
        response.body.forEach(section => {
            expect(valid).toContain(section.density);
        });
    });

    it('GET /api/crowd includes Cache-Control header', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.headers['cache-control']).toMatch(/max-age/);
    });

    it('GET /api/crowd/forecast returns a forecast string', async () => {
        const response = await request(app).get('/api/crowd/forecast');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('forecast');
        expect(typeof response.body.forecast).toBe('string');
        expect(response.body.forecast.length).toBeGreaterThan(0);
    });
});
