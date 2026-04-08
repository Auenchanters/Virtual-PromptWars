const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([]),
    getQueueData: jest.fn().mockResolvedValue([]),
}));

describe('Health Check API', () => {
    it('GET /health returns 200 with healthy status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
    });

    it('GET /health returns a timestamp', async () => {
        const response = await request(app).get('/health');
        expect(response.body).toHaveProperty('timestamp');
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('GET /health responds with JSON content type', async () => {
        const response = await request(app).get('/health');
        expect(response.headers['content-type']).toMatch(/json/);
    });
});
