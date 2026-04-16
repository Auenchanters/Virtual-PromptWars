process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';

jest.mock('../src/config/firebaseAdmin', () => ({
    db: { collection: jest.fn() },
    rtdb: { ref: jest.fn() },
}));

import { logAnalyticsEvent, logWarningEvent } from '../src/services/loggingService';

describe('loggingService', () => {
    let infoSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        infoSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it('logAnalyticsEvent emits structured JSON with Cloud Logging labels', () => {
        logAnalyticsEvent('test_event', { key: 'value' });

        expect(infoSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(infoSpy.mock.calls[0][0] as string);
        expect(logged.message).toBe('test_event');
        expect(logged.meta).toHaveProperty('key', 'value');
        expect(logged.meta['logging.googleapis.com/labels']).toEqual({ service: 'venueflow-backend' });
    });

    it('logWarningEvent emits structured JSON via console.warn', () => {
        logWarningEvent('warn_event', { alert: true });

        expect(warnSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(warnSpy.mock.calls[0][0] as string);
        expect(logged.message).toBe('warn_event');
        expect(logged.level).toBe('warn');
        expect(logged.meta).toHaveProperty('alert', true);
    });
});
