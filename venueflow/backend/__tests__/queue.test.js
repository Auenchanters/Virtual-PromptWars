const request = require('supertest');
const app = require('../src/app');

describe('Queue API', () => {
    it('GET /api/queue returns 200 with wait time objects', async () => {
        const response = await request(app).get('/api/queue');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('waitTimeMinutes');
    });
});
