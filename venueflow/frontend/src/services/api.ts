import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

export const fetchCrowdData = async () => {
  const { data } = await api.get('/crowd');
  return data;
};

export const fetchQueueData = async () => {
  const { data } = await api.get('/queue');
  return data;
};

export const chatGemini = async (message: string) => {
  const { data } = await api.post('/gemini/chat', { message });
  return data.reply;
};

export const getItinerary = async (section: string) => {
  const { data } = await api.post('/gemini/itinerary', { section });
  return data.itinerary;
};

export const broadcastStaffAlert = async (announcement: string) => {
  await api.post('/staff/broadcast', { announcement });
};
