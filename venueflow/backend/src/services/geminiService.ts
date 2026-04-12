import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';
import { logger } from '../utils/logger';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required');
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = 'gemini-2.5-flash';

function getModel(): GenerativeModel {
    return genAI.getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Conversational venue assistant with grounded stadium context.
 * @param {string} userMessage - The user's question or message to the venue assistant
 * @returns {Promise<string>} The AI-generated response from the venue assistant
 */
async function chatWithGemini(userMessage: string): Promise<string> {
    if (!userMessage) throw new Error('Message is required.');

    try {
        const model = getModel();
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
}

/**
 * Friendly summary of current crowd density for attendees.
 * @param {unknown[]} crowdData - Array of crowd density data objects for stadium sections
 * @returns {Promise<string>} A friendly one-sentence summary of current crowd conditions
 */
async function generateCrowdSummary(crowdData: unknown[]): Promise<string> {
    try {
        const model = getModel();
        const prompt =
            `Summarize the following stadium crowd data in one friendly sentence for attendees: ` +
            JSON.stringify(crowdData);
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err: unknown) {
        logger.error('Gemini crowd summary error', { error: (err instanceof Error ? err.message : String(err)) });
        return 'Crowd data is currently being updated.';
    }
}

/**
 * Predictive 15-minute crowd forecast. Takes current crowd + queue snapshots
 * and asks Gemini to recommend low-density alternative sections so attendees
 * can self-redistribute before bottlenecks form.
 * @param {unknown[]} crowdData - Array of current crowd density data objects
 * @param {unknown[]} queueData - Array of current queue wait time data objects
 * @returns {Promise<string>} A short 15-minute crowd forecast with recommendations
 */
async function generateCrowdForecast(crowdData: unknown[], queueData: unknown[]): Promise<string> {
    try {
        const model = getModel();
        const prompt =
            `You are the VenueFlow operations assistant. Given the current stadium crowd ` +
            `densities and queue wait times, write a short (max 3 sentences) 15-minute outlook ` +
            `for attendees. Call out any HIGH density sections, suggest one or two less-crowded ` +
            `alternatives, and mention the shortest queue type. Be encouraging and specific.\n\n` +
            `Crowd: ${JSON.stringify(crowdData)}\nQueues: ${JSON.stringify(queueData)}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err: unknown) {
        logger.error('Gemini forecast error', { error: (err instanceof Error ? err.message : String(err)) });
        return 'Crowd forecast is temporarily unavailable. Please check back in a moment.';
    }
}

/**
 * Crowd-aware itinerary generator — when current density is HIGH the prompt
 * asks Gemini to suggest lower-density alternatives so attendees avoid
 * bottlenecks proactively.
 * @param {string} section - The stadium section the attendee is sitting in
 * @param {unknown[]} crowdData - Optional array of live crowd density data objects
 * @returns {Promise<string>} A personalized itinerary with arrival time, gate, and concessions
 */
async function generateItinerary(section: string, crowdData: unknown[] = []): Promise<string> {
    if (!section) throw new Error('Section is required.');

    try {
        const model = getModel();
        const crowdContext = Array.isArray(crowdData) && crowdData.length > 0
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
}

export { chatWithGemini, generateCrowdSummary, generateCrowdForecast, generateItinerary };
