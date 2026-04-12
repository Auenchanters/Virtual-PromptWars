import { logger } from '../src/utils/logger';

describe('logger', () => {
    let infoSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        infoSpy = jest.spyOn(console, 'info').mockImplementation();
        warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('logger.info emits JSON to console.info', () => {
        logger.info('test message');
        expect(infoSpy).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.level).toBe('info');
        expect(parsed.message).toBe('test message');
        expect(parsed.timestamp).toBeDefined();
    });

    it('logger.error emits JSON to console.error', () => {
        logger.error('err msg');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
        expect(parsed.level).toBe('error');
        expect(parsed.message).toBe('err msg');
    });

    it('logger.warn emits JSON to console.warn', () => {
        logger.warn('warn msg');
        expect(warnSpy).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
        expect(parsed.level).toBe('warn');
        expect(parsed.message).toBe('warn msg');
    });

    it('logger.debug emits JSON to console.info', () => {
        logger.debug('debug msg');
        expect(infoSpy).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.level).toBe('debug');
        expect(parsed.message).toBe('debug msg');
    });

    it('extracts requestId from meta into top-level field', () => {
        logger.info('req test', { requestId: 'abc-123', extra: 'data' });
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.requestId).toBe('abc-123');
        expect(parsed.meta).toEqual({ extra: 'data' });
    });

    it('includes meta fields when provided without requestId', () => {
        logger.info('meta test', { foo: 'bar', count: 42 });
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.requestId).toBeUndefined();
        expect(parsed.meta).toEqual({ foo: 'bar', count: 42 });
    });

    it('omits meta when no extra keys beyond requestId', () => {
        logger.info('only reqId', { requestId: 'xyz' });
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.requestId).toBe('xyz');
        expect(parsed.meta).toBeUndefined();
    });

    it('omits meta when called without meta argument', () => {
        logger.info('no meta');
        const parsed = JSON.parse(infoSpy.mock.calls[0][0]);
        expect(parsed.meta).toBeUndefined();
        expect(parsed.requestId).toBeUndefined();
    });
});
