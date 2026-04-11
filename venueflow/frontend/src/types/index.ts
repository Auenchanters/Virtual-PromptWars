export type CrowdDensity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CrowdSection {
  section: string;
  density: CrowdDensity;
}

export interface QueueItem {
  id: string;
  type: string;
  waitTimeMinutes: number;
}

export interface Broadcast {
  id: string;
  text: string;
  time: number;
}

export interface RawBroadcast {
  text: string;
  time: number;
}
