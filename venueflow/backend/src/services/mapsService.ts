import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';
import { logger } from '../utils/logger';

// Stadium-area default so free-text inputs like "Gate A" or "Section 112"
// resolve near the venue instead of a global match. Overridable by passing
// fully-qualified coordinates in origin/destination.
const DEFAULT_STADIUM_REGION = 'in';
const DEFAULT_STADIUM_ORIGIN = '12.9788,77.5917'; // Near M. Chinnaswamy Stadium, Bengaluru

const mapsClient = new Client({});

export interface WalkingTimeResult {
    origin: string;
    destination: string;
    /** Distance in metres as returned by Google. */
    distanceMeters: number;
    /** Walking duration in seconds. */
    durationSeconds: number;
    /** Human-readable duration (e.g. "7 mins"). */
    durationText: string;
}

/**
 * Server-side walking-time lookup between two stadium locations via
 * Google Maps Distance Matrix API. Used for crowd-aware routing so
 * the itinerary planner can steer attendees via the fastest safe path.
 *
 * @throws When the API key is missing, the request fails, or no route is found.
 */
export async function getWalkingTime(
    origin: string,
    destination: string,
): Promise<WalkingTimeResult> {
    const apiKey = process.env.GOOGLE_MAPS_BACKEND_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_MAPS_BACKEND_API_KEY is not configured.');
    }
    if (!origin || !destination) {
        throw new Error('Origin and destination are required.');
    }

    const response = await mapsClient.distancematrix({
        params: {
            origins: [`${origin} near ${DEFAULT_STADIUM_ORIGIN}`],
            destinations: [`${destination} near ${DEFAULT_STADIUM_ORIGIN}`],
            mode: TravelMode.walking,
            units: UnitSystem.metric,
            region: DEFAULT_STADIUM_REGION,
            key: apiKey,
        },
        timeout: 5000,
    });

    const element = response.data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
        logger.warn('Distance Matrix returned a non-OK element', {
            status: element?.status,
            origin,
            destination,
        });
        throw new Error(`No walking route found from "${origin}" to "${destination}".`);
    }

    return {
        origin,
        destination,
        distanceMeters: element.distance.value,
        durationSeconds: element.duration.value,
        durationText: element.duration.text,
    };
}
