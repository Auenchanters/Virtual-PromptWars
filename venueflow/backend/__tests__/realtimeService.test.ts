process.env.STAFF_API_KEY = 'test-staff-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

const mockPush = jest.fn();
const mockRef = jest.fn(() => ({ push: mockPush }));

jest.mock('../src/config/firebaseAdmin', () => ({
    db: { collection: jest.fn() },
    rtdb: { ref: mockRef },
}));

import { broadcastMessage } from '../src/services/realtimeService';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('realtimeService – broadcastMessage', () => {
    it('pushes announcement to RTDB with text and timestamp', async () => {
        mockPush.mockResolvedValue(undefined);
        const before = Date.now();

        await broadcastMessage('Gate 7 is open');

        expect(mockRef).toHaveBeenCalledWith('announcements');
        expect(mockPush).toHaveBeenCalledTimes(1);

        const pushed = mockPush.mock.calls[0][0];
        expect(pushed.text).toBe('Gate 7 is open');
        expect(pushed.time).toBeGreaterThanOrEqual(before);
        expect(pushed.time).toBeLessThanOrEqual(Date.now());
    });

    it('throws when announcement is falsy', async () => {
        await expect(broadcastMessage('')).rejects.toThrow('Announcement required.');
        await expect(broadcastMessage(null as unknown as string)).rejects.toThrow('Announcement required.');
        await expect(broadcastMessage(undefined as unknown as string)).rejects.toThrow('Announcement required.');
    });

    it('throws when RTDB push fails', async () => {
        mockPush.mockRejectedValue(new Error('RTDB write failed'));

        await expect(broadcastMessage('Test')).rejects.toThrow('RTDB write failed');
    });

    it('handles non-Error rejection from RTDB', async () => {
        mockPush.mockRejectedValue('string-error');

        await expect(broadcastMessage('Test non-Error')).rejects.toBe('string-error');
    });
});
