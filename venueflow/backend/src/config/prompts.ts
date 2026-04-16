// FIXED: Extracted all hardcoded prompt strings from geminiService.ts into reusable constants
import type { CrowdSection } from '../types';

/**
 * System prompt for the conversational venue assistant. Contains grounded
 * stadium facts (gate layout, concession stand locations) so the model
 * can answer attendee FAQs without hallucinating.
 */
export const CHAT_SYSTEM_PROMPT =
    `You are VenueFlow Bot, an AI stadium assistant. You provide brief, helpful answers. ` +
    `Context: Gates 1-4 are entry, Gates 5-8 are exit. Food is available throughout the ` +
    `venue, vegan options at Stand 12.`;

/**
 * Build the full forecast prompt from serialized crowd and queue data.
 * The prompt instructs the model to produce a concise 15-minute outlook.
 */
export function buildForecastPrompt(crowdJson: string, queueJson: string): string {
    return (
        `You are the VenueFlow operations assistant. Given the current stadium crowd ` +
        `densities and queue wait times, write a short (max 3 sentences) 15-minute outlook ` +
        `for attendees. Call out any HIGH density sections, suggest one or two less-crowded ` +
        `alternatives, and mention the shortest queue type. Be encouraging and specific.\n\n` +
        `Crowd: ${crowdJson}\nQueues: ${queueJson}`
    );
}

/**
 * Build crowd-context string for itinerary generation. Returns an empty
 * string when no crowd data is available so the prompt still works.
 */
export function buildCrowdContext(crowdData: CrowdSection[]): string {
    if (crowdData.length === 0) return '';
    return (
        `Current live crowd densities: ${JSON.stringify(crowdData)}. ` +
        `If the attendee's section is HIGH density, explicitly suggest a less-crowded ` +
        `alternative route or nearby section and recommend a quieter concession stand.`
    );
}

/**
 * Build the itinerary generation prompt for a given seating section.
 */
export function buildItineraryPrompt(section: string, crowdContext: string): string {
    return (
        `Generate a short, friendly itinerary for a stadium attendee sitting in section ` +
        `${section}. Suggest arrival time, best gate, and nearest concessions. ${crowdContext}`
    );
}

/**
 * Build the crowd summary prompt from serialized crowd data.
 * The prompt instructs the model to produce a single friendly sentence.
 */
export function buildCrowdSummaryPrompt(crowdJson: string): string {
    return `Summarize the following stadium crowd data in one friendly sentence for attendees: ${crowdJson}`;
}
