import crypto from 'crypto';
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from '@google/generative-ai';
import type { GenerativeModel, SafetySetting } from '@google/generative-ai';
import NodeCache from 'node-cache';
import type { CrowdSection, QueueItem } from '../types';
import { logger } from '../utils/logger';
import {
    CACHE_TTL_SECONDS,
    FORECAST_CACHE_TTL_SECONDS,
} from '../config/constants';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required');

const MODEL_NAME = 'gemini-2.5-flash';

const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const genAI = new GoogleGenerativeAI(apiKey);
// Model instance is memoized once at module load — creating it per-request
// wastes CPU and allocates a fresh HTTP client for every Gemini call.
const model: GenerativeModel = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings,
});

// Response caches keyed by hash of prompt inputs. Forecast changes slowly, so
// it gets a longer TTL; chat/itinerary responses still benefit from dedupe
// across concurrent requests (single-flight below).
const responseCache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });
const forecastCache = new NodeCache({ stdTTL: FORECAST_CACHE_TTL_SECONDS });

const inflight = new Map<string, Promise<string>>();

function keyOf(namespace: string, payload: unknown): string {
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 32);
    return `${namespace}:${hash}`;
}

async function cached(
    store: NodeCache,
    cacheKey: string,
    producer: () => Promise<string>,
): Promise<string> {
    const hit = store.get<string>(cacheKey);
    if (hit) return hit;

    const pending = inflight.get(cacheKey);
    if (pending) return pending;

    const task = (async () => {
        try {
            const value = await producer();
            store.set(cacheKey, value);
            return value;
        } finally {
            inflight.delete(cacheKey);
        }
    })();

    inflight.set(cacheKey, task);
    return task;
}

/**
 * Conversational venue assistant with grounded stadium context.
 * Responses are cached by message hash so repeated FAQs (e.g. "where is gate 4?")
 * don't re-hit Gemini within the cache window.
 *
 * @throws When the underlying Gemini call fails or the message is missing.
 */
async function chatWithGemini(userMessage: string): Promise<string> {
    if (!userMessage) throw new Error('Message is required.');

    return cached(responseCache, keyOf('chat', userMessage), async () => {
        try {
            const prompt =
                `You are VenueFlow Bot, an AI stadium assistant. You provide brief, helpful answers. ` +
                `Context: Gates 1-4 are entry, Gates 5-8 are exit. Food is available throughout the ` +
                `venue, vegan options at Stand 12. Question: ${userMessage}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err: unknown) {
            logger.error('Gemini chat error', { error: (err instanceof Error ? err.message : String(err)) });
            throw err;
        }
    });
}

/**
 * Friendly summary of current crowd density for attendees.
 * Falls back to a safe static string rather than throwing so the UI
 * never renders a broken dashboard card.
 */
async function generateCrowdSummary(crowdData: CrowdSection[]): Promise<string> {
    try {
        return await cached(responseCache, keyOf('summary', crowdData), async () => {
            const prompt =
                `Summarize the following stadium crowd data in one friendly sentence for attendees: ` +
                JSON.stringify(crowdData);
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (err: unknown) {
        logger.error('Gemini crowd summary error', { error: (err instanceof Error ? err.message : String(err)) });
        return 'Crowd data is currently being updated.';
    }
}

/**
 * Predictive 15-minute crowd forecast. Takes current crowd + queue snapshots
 * and asks Gemini to recommend low-density alternative sections so attendees
 * can self-redistribute before bottlenecks form. Cached for 60 s since this
 * is the highest-volume endpoint (refreshes every minute on the dashboard).
 */
async function generateCrowdForecast(crowdData: CrowdSection[], queueData: QueueItem[]): Promise<string> {
    try {
        return await cached(forecastCache, keyOf('forecast', { crowdData, queueData }), async () => {
            const prompt =
                `You are the VenueFlow operations assistant. Given the current stadium crowd ` +
                `densities and queue wait times, write a short (max 3 sentences) 15-minute outlook ` +
                `for attendees. Call out any HIGH density sections, suggest one or two less-crowded ` +
                `alternatives, and mention the shortest queue type. Be encouraging and specific.\n\n` +
                `Crowd: ${JSON.stringify(crowdData)}\nQueues: ${JSON.stringify(queueData)}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (err: unknown) {
        logger.error('Gemini forecast error', { error: (err instanceof Error ? err.message : String(err)) });
        return 'Crowd forecast is temporarily unavailable. Please check back in a moment.';
    }
}

/**
 * Crowd-aware itinerary generator — when current density is HIGH the prompt
 * asks Gemini to suggest lower-density alternatives so attendees avoid
 * bottlenecks proactively.
 *
 * @throws When the Gemini call fails or the section is missing.
 */
async function generateItinerary(section: string, crowdData: CrowdSection[] = []): Promise<string> {
    if (!section) throw new Error('Section is required.');

    return cached(responseCache, keyOf('itinerary', { section, crowdData }), async () => {
        try {
            const crowdContext = crowdData.length > 0
                ? `Current live crowd densities: ${JSON.stringify(crowdData)}. ` +
                  `If the attendee's section is HIGH density, explicitly suggest a less-crowded ` +
                  `alternative route or nearby section and recommend a quieter concession stand.`
                : '';
            const prompt =
                `Generate a short, friendly itinerary for a stadium attendee sitting in section ` +
                `${section}. Suggest arrival time, best gate, and nearest concessions. ${crowdContext}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err: unknown) {
            logger.error('Gemini itinerary error', { error: (err instanceof Error ? err.message : String(err)) });
            throw err;
        }
    });
}

export { chatWithGemini, generateCrowdSummary, generateCrowdForecast, generateItinerary };
