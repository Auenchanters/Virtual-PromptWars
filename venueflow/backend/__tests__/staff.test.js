const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/realtimeService', () => ({
    broadcastMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([{ section: '101', density: 'HIGH' }]),
    getQueueData: jest.fn().mockResolvedValue([{ id: 'gate-1', type: 'gate', waitTimeMinutes: 10 }]),
}));

describe('Staff Broadcast API', () => {
    it('POST /api/staff/broadcast returns 201 with success for valid announcement', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send({ announcement: 'Gate 7 is now open for entry' });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Broadcast sent successfully');
    });

    it('POST /api/staff/broadcast returns 400 when announcement is missing', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('POST /api/staff/broadcast returns 400 when announcement is empty string', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send({ announcement: '' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('POST /api/staff/broadcast returns 400 when announcement is not a string', async () => {
        const response = await request(app)
            .post('/api/staff/broadcast')
            .send({ announcement: 99 });
        expect(response.status).toBe(400);
    });
});
