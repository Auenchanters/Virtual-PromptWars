process.env.GEMINI_API_KEY = 'test-gemini-key';

const mockGenerateContent = jest.fn().mockResolvedValue({
    response: { text: () => 'mock response' },
});

const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
    HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
        HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
        BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
    },
}));

jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => {
        const store = new Map<string, unknown>();
        return {
            get: (key: string) => store.get(key),
            set: (key: string, value: unknown) => {
                store.set(key, value);
                return true;
            },
        };
    });
});

import {
    chatWithGemini,
    generateCrowdSummary,
    generateCrowdForecast,
    generateItinerary,
} from '../src/services/geminiService';
import type { CrowdSection, QueueItem } from '../src/types';

describe('geminiService', () => {
    beforeEach(() => {
        mockGenerateContent.mockClear();
        // Reset to happy-path default before each test
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'mock response' },
        });
    });

    describe('happy paths', () => {
        it('chatWithGemini returns grounded text for valid input', async () => {
            const result = await chatWithGemini('Where is gate 4?');
            expect(result).toBe('mock response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            const [arg] = mockGenerateContent.mock.calls[0] as [{ tools?: unknown }];
            // Google Search grounding tool is attached to the chat request.
            expect(arg).toHaveProperty('tools');
            expect(arg.tools).toEqual([{ googleSearch: {} }]);
        });

        it('generateCrowdSummary returns text for crowd data', async () => {
            const crowd: CrowdSection[] = [{ id: '1', section: '101', density: 'HIGH' }];
            const result = await generateCrowdSummary(crowd);
            expect(result).toBe('mock response');
        });

        it('generateCrowdForecast returns text for crowd + queue snapshot', async () => {
            const crowd: CrowdSection[] = [{ id: '2', section: '102', density: 'LOW' }];
            const queues: QueueItem[] = [{ id: 'gate-1', type: 'gate', waitTimeMinutes: 5 }];
            const result = await generateCrowdForecast(crowd, queues);
            expect(result).toBe('mock response');
        });

        it('generateItinerary returns text for valid section', async () => {
            const result = await generateItinerary('112', []);
            expect(result).toBe('mock response');
        });

        it('generateItinerary includes crowd context when crowd data provided', async () => {
            const crowd: CrowdSection[] = [{ id: '3', section: '112', density: 'HIGH' }];
            const result = await generateItinerary('112-B', crowd);
            expect(result).toBe('mock response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });
    });

    describe('failure paths', () => {
        it('chatWithGemini throws when message is empty', async () => {
            await expect(chatWithGemini('')).rejects.toThrow('Message is required.');
        });

        it('generateItinerary throws when section is empty', async () => {
            await expect(generateItinerary('')).rejects.toThrow('Section is required.');
        });

        it('chatWithGemini propagates Gemini API error', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('Gemini API down'));
            await expect(chatWithGemini('unique-error-test-msg-chat')).rejects.toThrow('Gemini API down');
        });

        it('generateCrowdSummary returns fallback string on Gemini error', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('quota exceeded'));
            const crowd: CrowdSection[] = [{ id: '99', section: 'ERR', density: 'LOW' }];
            const result = await generateCrowdSummary(crowd);
            expect(result).toBe('Crowd data is currently being updated.');
        });

        it('generateCrowdForecast returns fallback string on Gemini error', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('network timeout'));
            const crowd: CrowdSection[] = [{ id: '98', section: 'ERR2', density: 'MEDIUM' }];
            const queues: QueueItem[] = [{ id: 'q-err', type: 'concession', waitTimeMinutes: 99 }];
            const result = await generateCrowdForecast(crowd, queues);
            expect(result).toBe('Crowd forecast is temporarily unavailable. Please check back in a moment.');
        });

        it('generateItinerary propagates Gemini API error', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('model overloaded'));
            await expect(generateItinerary('unique-error-section-999')).rejects.toThrow('model overloaded');
        });
    });

    describe('caching behaviour', () => {
        it('returns cached response on second identical chat call', async () => {
            const msg = 'cache-hit-test-message';
            const first = await chatWithGemini(msg);
            mockGenerateContent.mockClear();

            const second = await chatWithGemini(msg);
            expect(second).toBe(first);
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('deduplicates concurrent identical chat calls (single-flight)', async () => {
            const msg = 'inflight-dedup-test-msg';
            // Fire two concurrent calls without awaiting
            const [a, b] = await Promise.all([
                chatWithGemini(msg),
                chatWithGemini(msg),
            ]);
            expect(a).toBe('mock response');
            expect(b).toBe('mock response');
            // generateContent should be called at most once
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('returns cached response on second identical summary call', async () => {
            const crowd: CrowdSection[] = [{ id: 'cache-s', section: 'C1', density: 'LOW' }];
            await generateCrowdSummary(crowd);
            mockGenerateContent.mockClear();

            const second = await generateCrowdSummary(crowd);
            expect(second).toBe('mock response');
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('returns cached response on second identical forecast call', async () => {
            const crowd: CrowdSection[] = [{ id: 'cache-f', section: 'F1', density: 'MEDIUM' }];
            const queues: QueueItem[] = [{ id: 'cache-q', type: 'gate', waitTimeMinutes: 3 }];
            await generateCrowdForecast(crowd, queues);
            mockGenerateContent.mockClear();

            const second = await generateCrowdForecast(crowd, queues);
            expect(second).toBe('mock response');
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('returns cached response on second identical itinerary call', async () => {
            const crowd: CrowdSection[] = [{ id: 'cache-i', section: 'I1', density: 'HIGH' }];
            await generateItinerary('cache-sec-200', crowd);
            mockGenerateContent.mockClear();

            const second = await generateItinerary('cache-sec-200', crowd);
            expect(second).toBe('mock response');
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });
    });
});
