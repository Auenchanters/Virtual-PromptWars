process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';
process.env.GOOGLE_MAPS_BACKEND_API_KEY = 'test-maps-key';

import request from 'supertest';

jest.mock('../src/services/firestoreService', () => ({
    getCrowdData: jest.fn().mockResolvedValue([]),
    getQueueData: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/services/geminiService', () => ({
    chatWithGemini: jest.fn().mockResolvedValue('Mocked'),
    generateItinerary: jest.fn().mockResolvedValue('Mocked'),
    generateCrowdSummary: jest.fn().mockResolvedValue('Mocked'),
    generateCrowdForecast: jest.fn().mockResolvedValue('Mocked'),
}));

jest.mock('../src/services/storageService', () => ({
    exportAnalyticsSnapshot: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/loggingService', () => ({
    logAnalyticsEvent: jest.fn(),
    logWarningEvent: jest.fn(),
}));

jest.mock('../src/services/mapsService', () => ({
    getWalkingTime: jest.fn().mockResolvedValue({
        origin: 'Gate A',
        destination: 'Section 112',
        distanceMeters: 450,
        durationSeconds: 360,
        durationText: '6 mins',
    }),
}));

import app from '../src/app';
import { getWalkingTime } from '../src/services/mapsService';

describe('GET /api/maps/distance', () => {
    beforeEach(() => {
        (getWalkingTime as jest.Mock).mockReset().mockResolvedValue({
            origin: 'Gate A',
            destination: 'Section 112',
            distanceMeters: 450,
            durationSeconds: 360,
            durationText: '6 mins',
        });
    });

    it('returns 200 and walking time on success', async () => {
        const response = await request(app)
            .get('/api/maps/distance')
            .query({ origin: 'Gate A', destination: 'Section 112' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            origin: 'Gate A',
            destination: 'Section 112',
            distanceMeters: 450,
            durationSeconds: 360,
            durationText: '6 mins',
        });
        expect(getWalkingTime).toHaveBeenCalledWith('Gate A', 'Section 112');
    });

    it('returns 500 when getWalkingTime throws an error', async () => {
        (getWalkingTime as jest.Mock).mockRejectedValueOnce(
            new Error('Distance Matrix API down'),
        );

        const response = await request(app)
            .get('/api/maps/distance')
            .query({ origin: 'Gate A', destination: 'Section 112' });

        expect(response.status).toBe(500);
    });

    it('returns 400 when origin or destination query parameter is missing', async () => {
        const response = await request(app)
            .get('/api/maps/distance')
            .query({ origin: 'Gate A' });

        expect(response.status).toBe(400);
        expect(getWalkingTime).not.toHaveBeenCalled();
    });
});
