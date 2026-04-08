const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([
        { section: '101', density: 'HIGH' },
    ]),
    getQueueData: jest.fn().mockResolvedValue([
        { id: 'gate-1', type: 'gate', waitTimeMinutes: 15 },
        { id: 'concessions-12', type: 'concessions', waitTimeMinutes: 5 },
        { id: 'restroom-west', type: 'restroom', waitTimeMinutes: 2 },
    ]),
}));

describe('Queue API', () => {
    it('GET /api/queue returns 200 with array of queues', async () => {
        const response = await request(app).get('/api/queue');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /api/queue returns queue objects with required fields', async () => {
        const response = await request(app).get('/api/queue');
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('waitTimeMinutes');
    });

    it('GET /api/queue returns numeric wait times', async () => {
        const response = await request(app).get('/api/queue');
        response.body.forEach(queue => {
            expect(typeof queue.waitTimeMinutes).toBe('number');
            expect(queue.waitTimeMinutes).toBeGreaterThanOrEqual(0);
        });
    });

    it('GET /api/queue returns multiple queue types', async () => {
        const response = await request(app).get('/api/queue');
        const types = response.body.map(q => q.type);
        expect(types).toContain('gate');
        expect(types).toContain('concessions');
    });
});
