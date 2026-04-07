const request = require('supertest');
const app = require('../src/app');

describe('Crowd API', () => {
    it('GET /api/crowd returns 200 with array of section data', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('section');
        expect(response.body[0]).toHaveProperty('density');
    });
});
