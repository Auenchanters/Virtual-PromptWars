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
    });

    describe('happy paths', () => {
        it('chatWithGemini returns grounded text for valid input', async () => {
            const result = await chatWithGemini('Where is gate 4?');
            expect(result).toBe('mock response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            const [arg] = mockGenerateContent.mock.calls[0];
            expect(arg).toHaveProperty('tools');
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
    });

    describe('failure paths', () => {
        it('chatWithGemini throws when message is empty', async () => {
            await expect(chatWithGemini('')).rejects.toThrow('Message is required.');
        });

        it('generateItinerary throws when section is empty', async () => {
            await expect(generateItinerary('')).rejects.toThrow('Section is required.');
        });
    });
});
