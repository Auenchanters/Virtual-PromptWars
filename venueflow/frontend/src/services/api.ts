import axios from 'axios';
import { CrowdSection, QueueItem } from '../types';
import {
  MAX_MESSAGE_LENGTH,
  MAX_SECTION_LENGTH,
  MAX_ANNOUNCEMENT_LENGTH,
} from '../utils/constants';
import { clampInput } from '../utils/sanitize';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15_000,
});

export const fetchCrowdData = async (): Promise<CrowdSection[]> => {
  const { data } = await api.get<CrowdSection[]>('/crowd');
  return data;
};

export const fetchQueueData = async (): Promise<QueueItem[]> => {
  const { data } = await api.get<QueueItem[]>('/queue');
  return data;
};

export const fetchCrowdForecast = async (): Promise<string> => {
  const { data } = await api.get<{ forecast: string }>('/crowd/forecast');
  return data.forecast;
};

export const chatGemini = async (message: string): Promise<string> => {
  const { data } = await api.post<{ reply: string }>('/gemini/chat', {
    message: clampInput(message, MAX_MESSAGE_LENGTH),
  });
  return data.reply;
};

export const getItinerary = async (section: string): Promise<string> => {
  const { data } = await api.post<{ itinerary: string }>('/gemini/itinerary', {
    section: clampInput(section, MAX_SECTION_LENGTH),
  });
  return data.itinerary;
};

export const broadcastStaffAlert = async (announcement: string): Promise<void> => {
  const staffKey = import.meta.env.VITE_STAFF_API_KEY || '';
  await api.post(
    '/staff/broadcast',
    { announcement: clampInput(announcement, MAX_ANNOUNCEMENT_LENGTH) },
    { headers: { 'X-Staff-Key': staffKey } }
  );
};
