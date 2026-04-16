process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.GOOGLE_MAPS_BACKEND_API_KEY = 'test-maps-key';

const mockDistanceMatrix = jest.fn();

jest.mock('@googlemaps/google-maps-services-js', () => {
    const actual = jest.requireActual('@googlemaps/google-maps-services-js');
    return {
        ...actual,
        Client: jest.fn().mockImplementation(() => ({
            distancematrix: mockDistanceMatrix,
        })),
    };
});

import { getWalkingTime } from '../src/services/mapsService';

const okResponse = {
    data: {
        rows: [
            {
                elements: [
                    {
                        status: 'OK',
                        distance: { value: 450, text: '0.5 km' },
                        duration: { value: 360, text: '6 mins' },
                    },
                ],
            },
        ],
    },
};

describe('mapsService.getWalkingTime', () => {
    const ORIGINAL_KEY = process.env.GOOGLE_MAPS_BACKEND_API_KEY;

    beforeEach(() => {
        mockDistanceMatrix.mockReset().mockResolvedValue(okResponse);
        process.env.GOOGLE_MAPS_BACKEND_API_KEY = 'test-maps-key';
        delete process.env.VITE_GOOGLE_MAPS_API_KEY;
    });

    afterAll(() => {
        process.env.GOOGLE_MAPS_BACKEND_API_KEY = ORIGINAL_KEY;
    });

    it('returns parsed walking time on success', async () => {
        const result = await getWalkingTime('Gate A', 'Section 112');
        expect(result).toEqual({
            origin: 'Gate A',
            destination: 'Section 112',
            distanceMeters: 450,
            durationSeconds: 360,
            durationText: '6 mins',
        });
        expect(mockDistanceMatrix).toHaveBeenCalledTimes(1);
    });

    it('falls back to VITE_GOOGLE_MAPS_API_KEY when backend key is unset', async () => {
        delete process.env.GOOGLE_MAPS_BACKEND_API_KEY;
        process.env.VITE_GOOGLE_MAPS_API_KEY = 'vite-fallback-key';
        const result = await getWalkingTime('Gate A', 'Section 112');
        expect(result.durationSeconds).toBe(360);
    });

    it('throws when no API key is configured', async () => {
        delete process.env.GOOGLE_MAPS_BACKEND_API_KEY;
        delete process.env.VITE_GOOGLE_MAPS_API_KEY;
        await expect(getWalkingTime('Gate A', 'Section 112')).rejects.toThrow(
            /api key/i,
        );
    });

    it('throws when origin or destination is missing', async () => {
        await expect(getWalkingTime('', 'Section 112')).rejects.toThrow(/required/i);
        await expect(getWalkingTime('Gate A', '')).rejects.toThrow(/required/i);
    });

    it('throws when Distance Matrix returns a non-OK element status', async () => {
        mockDistanceMatrix.mockResolvedValueOnce({
            data: {
                rows: [{ elements: [{ status: 'ZERO_RESULTS' }] }],
            },
        });
        await expect(getWalkingTime('Gate A', 'Nowhere')).rejects.toThrow(/no walking route/i);
    });

    it('throws when response is malformed (missing element)', async () => {
        mockDistanceMatrix.mockResolvedValueOnce({ data: { rows: [{ elements: [] }] } });
        await expect(getWalkingTime('Gate A', 'Section 112')).rejects.toThrow(
            /no walking route/i,
        );
    });
});
