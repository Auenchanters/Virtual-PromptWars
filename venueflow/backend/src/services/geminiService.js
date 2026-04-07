const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

/**
 * Chats with the Gemini assistant providing venue context.
 * @param {string} userMessage - The user request message.
 * @returns {Promise<string>} The response from the AI.
 */
async function chatWithGemini(userMessage) {
    if (!userMessage) throw new Error('Message is required.');
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: `You are VenueFlow Bot, an AI stadium assistant. You provide brief, helpful answers. Context: Gates 1-4 are entry, Gates 5-8 are exit. Food is everywhere, vegan at Stand 12. ${userMessage}` }
                    ]
                }
            ]
        });
        return response.text;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini API Error:', err);
        throw err;
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: `Generate a short itinerary for a stadium attendee sitting in section ${section}. Suggest arrival time, best gate, and nearest concessions.` }
                    ]
                }
            ]
        });
        return response.text;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gemini API Error:', err);
        throw err;
    }
}

module.exports = { chatWithGemini, generateItinerary };
