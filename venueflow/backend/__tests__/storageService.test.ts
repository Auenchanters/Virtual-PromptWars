process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const mockSave = jest.fn().mockResolvedValue(undefined);
const mockFile = jest.fn(() => ({ save: mockSave }));
const mockBucket = jest.fn(() => ({ file: mockFile }));

jest.mock('../src/config/firebaseAdmin', () => ({
    admin: {
        storage: () => ({ bucket: mockBucket }),
    },
    db: { collection: jest.fn() },
    rtdb: { ref: jest.fn() },
}));

import { exportAnalyticsSnapshot } from '../src/services/storageService';
import type { CrowdSection } from '../src/types';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('storageService – exportAnalyticsSnapshot', () => {
    it('exports crowd data to Cloud Storage as JSON', async () => {
        const data: CrowdSection[] = [
            { id: '1', section: '101', density: 'HIGH' },
            { id: '2', section: '102', density: 'LOW' },
        ];

        await exportAnalyticsSnapshot(data);

        expect(mockFile).toHaveBeenCalledTimes(1);
        const filename = (mockFile.mock.calls[0] as unknown[])[0] as string;
        expect(filename).toMatch(/^analytics\/crowd-/);
        expect(mockSave).toHaveBeenCalledTimes(1);
        const args = mockSave.mock.calls[0] as unknown[];
        const body = args[0] as string;
        const opts = args[1] as { contentType: string };
        const parsed = JSON.parse(body);
        expect(parsed.sections).toEqual(data);
        expect(parsed).toHaveProperty('timestamp');
        expect(opts.contentType).toBe('application/json');
    });

    it('swallows errors silently without throwing', async () => {
        mockSave.mockRejectedValueOnce(new Error('Storage unavailable'));

        const data: CrowdSection[] = [{ id: '1', section: '101', density: 'MEDIUM' }];
        await expect(exportAnalyticsSnapshot(data)).resolves.toBeUndefined();
    });

    it('handles non-Error rejection from Cloud Storage', async () => {
        mockSave.mockRejectedValueOnce('string-error');

        const data: CrowdSection[] = [{ id: '1', section: '101', density: 'LOW' }];
        await expect(exportAnalyticsSnapshot(data)).resolves.toBeUndefined();
    });
});
