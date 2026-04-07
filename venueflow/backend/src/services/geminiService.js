const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'mock-key');

/**
 * Chats with the Gemini assistant providing venue context.
 * @param {string} userMessage - The user request message.
 * @returns {Promise<string>} The response from the AI.
 */
async function chatWithGemini(userMessage) {
    if (!userMessage) throw new Error('Message is required.');

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are VenueFlow Bot, an AI stadium assistant. You provide brief, helpful answers. Context: Gates 1-4 are entry, Gates 5-8 are exit. Food is available throughout the venue, vegan options at Stand 12. ${userMessage}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini API Error:', err);
        throw err;
    }
}

/**
 * Generates a crowd summary using Gemini AI.
 * @param {Array} crowdData - Array of crowd section objects.
 * @returns {Promise<string>} Natural language crowd summary.
 */
async function generateCrowdSummary(crowdData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Summarize the following stadium crowd data in one friendly sentence for attendees: ${JSON.stringify(crowdData)}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini crowd summary error:', err);
        return 'Crowd data is currently being updated.';
    }
}

/**
 * Generates an itinerary based on user seating section.
 * @param {string} section - The seating section.
 * @returns {Promise<string>} Generated itinerary in natural language.
 */
async function generateItinerary(section) {
    if (!section) throw new Error('Section is required.');

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Generate a short itinerary for a stadium attendee sitting in section ${section}. Suggest arrival time, best gate, and nearest concessions.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini API Error:', err);
        throw err;
    }
}

module.exports = { chatWithGemini, generateCrowdSummary, generateItinerary };
