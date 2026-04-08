const request = require('supertest');
const app = require('../src/app');

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
        const validDensities = ['LOW', 'MEDIUM', 'HIGH'];
        response.body.forEach(section => {
            expect(validDensities).toContain(section.density);
        });
    });

    it('GET /api/crowd includes Cache-Control header', async () => {
        const response = await request(app).get('/api/crowd');
        expect(response.headers['cache-control']).toMatch(/max-age/);
    });
});
