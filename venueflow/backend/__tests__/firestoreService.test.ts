process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const mockGet = jest.fn();
const mockCollection = jest.fn(() => ({ get: mockGet }));
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();

jest.mock('../src/config/firebaseAdmin', () => ({
    db: { collection: mockCollection },
    rtdb: { ref: jest.fn() },
}));

jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => ({
        get: mockCacheGet,
        set: mockCacheSet,
    }));
});

import { getCrowdData, getQueueData } from '../src/services/firestoreService';

beforeEach(() => {
    jest.clearAllMocks();
});

function makeSnapshot(docs: Array<{ id: string; data: Record<string, unknown> }>) {
    return {
        forEach(cb: (doc: { id: string; data: () => Record<string, unknown> }) => void) {
            docs.forEach(d => cb({ id: d.id, data: () => d.data }));
        },
    };
}

describe('firestoreService – getCrowdData', () => {
    it('returns cached data when cache hit', async () => {
        const cached = [{ section: '101', density: 'LOW' }];
        mockCacheGet.mockReturnValue(cached);

        const result = await getCrowdData();

        expect(result).toBe(cached);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it('fetches from Firestore and caches on cache miss', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'sec-1', data: { section: '101', density: 'HIGH' } },
                { id: 'sec-2', data: { section: '102', density: 'LOW' } },
            ]),
        );

        const result = await getCrowdData();

        expect(mockCollection).toHaveBeenCalledWith('crowd');
        expect(result).toEqual([
            { id: 'sec-1', section: '101', density: 'HIGH' },
            { id: 'sec-2', section: '102', density: 'LOW' },
        ]);
        expect(mockCacheSet).toHaveBeenCalledWith('crowd_data', result);
    });

    it('returns fallback data when collection is empty', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(makeSnapshot([]));

        const result = await getCrowdData();

        expect(result.length).toBe(4);
        expect(result[0]).toHaveProperty('section', '101');
        expect(result[0]).toHaveProperty('density', 'HIGH');
    });

    it('throws when Firestore read fails', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockRejectedValue(new Error('Firestore unavailable'));

        await expect(getCrowdData()).rejects.toThrow('Firestore unavailable');
    });

    it('drops malformed crowd documents and returns only valid ones', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'good', data: { section: '101', density: 'HIGH' } },
                { id: 'bad', data: { section: '', density: 'INVALID_VALUE' } },
            ]),
        );

        const result = await getCrowdData();
        expect(result).toEqual([{ id: 'good', section: '101', density: 'HIGH' }]);
    });

    it('returns fallback when all crowd documents are malformed', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'bad1', data: { section: 123, density: null } },
            ]),
        );

        const result = await getCrowdData();
        expect(result.length).toBe(4); // fallback data
    });
});

describe('firestoreService – getQueueData', () => {
    it('returns cached data when cache hit', async () => {
        const cached = [{ id: 'gate-1', type: 'gate', waitTimeMinutes: 5 }];
        mockCacheGet.mockReturnValue(cached);

        const result = await getQueueData();

        expect(result).toBe(cached);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it('fetches from Firestore and caches on cache miss', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'gate-1', data: { type: 'gate', waitTimeMinutes: 10 } },
            ]),
        );

        const result = await getQueueData();

        expect(mockCollection).toHaveBeenCalledWith('queues');
        expect(result).toEqual([
            { id: 'gate-1', type: 'gate', waitTimeMinutes: 10 },
        ]);
        expect(mockCacheSet).toHaveBeenCalledWith('queue_data', result);
    });

    it('returns fallback data when collection is empty', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(makeSnapshot([]));

        const result = await getQueueData();

        expect(result.length).toBe(3);
        expect(result[0]).toHaveProperty('id', 'gate-1');
        expect(result[0]).toHaveProperty('type', 'gate');
    });

    it('throws when Firestore read fails', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockRejectedValue(new Error('Connection lost'));

        await expect(getQueueData()).rejects.toThrow('Connection lost');
    });

    it('drops malformed queue documents and returns only valid ones', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'good', data: { type: 'gate', waitTimeMinutes: 5 } },
                { id: 'bad', data: { type: '', waitTimeMinutes: -1 } },
            ]),
        );

        const result = await getQueueData();
        expect(result).toEqual([{ id: 'good', type: 'gate', waitTimeMinutes: 5 }]);
    });

    it('returns fallback when all queue documents are malformed', async () => {
        mockCacheGet.mockReturnValue(undefined);
        mockGet.mockResolvedValue(
            makeSnapshot([
                { id: 'bad1', data: { type: null, waitTimeMinutes: 'not-a-number' } },
            ]),
        );

        const result = await getQueueData();
        expect(result.length).toBe(3); // fallback data
    });
});
