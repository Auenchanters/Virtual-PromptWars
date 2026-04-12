export type CrowdDensity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CrowdSection {
    id: string;
    section: string;
    density: string;
}

export interface QueueItem {
    id: string;
    type: string;
    waitTimeMinutes: number;
}

export interface BroadcastPayload {
    text: string;
    time: number;
}

export interface GeminiChatRequest {
    message: string;
}

export interface GeminiItineraryRequest {
    section: string;
}

export interface StaffBroadcastRequest {
    announcement: string;
}
