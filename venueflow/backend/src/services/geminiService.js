const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required');
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = 'gemini-2.0-flash';

function getModel() {
    return genAI.getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Conversational venue assistant with grounded stadium context.
 */
async function chatWithGemini(userMessage) {
    if (!userMessage) throw new Error('Message is required.');

    try {
        const model = getModel();
        const prompt =
            `You are VenueFlow Bot, an AI stadium assistant. You provide brief, helpful answers. ` +
            `Context: Gates 1-4 are entry, Gates 5-8 are exit. Food is available throughout the ` +
            `venue, vegan options at Stand 12. Question: ${userMessage}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        logger.error('Gemini chat error', { error: err.message });
        throw err;
    }
}

/**
 * Friendly summary of current crowd density for attendees.
 */
async function generateCrowdSummary(crowdData) {
    try {
        const model = getModel();
        const prompt =
            `Summarize the following stadium crowd data in one friendly sentence for attendees: ` +
            JSON.stringify(crowdData);
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        logger.error('Gemini crowd summary error', { error: err.message });
        return 'Crowd data is currently being updated.';
    }
}

/**
 * Predictive 15-minute crowd forecast. Takes current crowd + queue snapshots
 * and asks Gemini to recommend low-density alternative sections so attendees
 * can self-redistribute before bottlenecks form.
 */
async function generateCrowdForecast(crowdData, queueData) {
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
    } catch (err) {
        logger.error('Gemini forecast error', { error: err.message });
        return 'Crowd forecast is temporarily unavailable. Please check back in a moment.';
    }
}

/**
 * Crowd-aware itinerary generator — when current density is HIGH the prompt
 * asks Gemini to suggest lower-density alternatives so attendees avoid
 * bottlenecks proactively.
 */
async function generateItinerary(section, crowdData = []) {
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
    } catch (err) {
        logger.error('Gemini itinerary error', { error: err.message });
        throw err;
    }
}

module.exports = {
    chatWithGemini,
    generateCrowdSummary,
    generateCrowdForecast,
    generateItinerary,
};
