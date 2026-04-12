import axios from 'axios';
import {
  fetchCrowdData,
  fetchQueueData,
  fetchCrowdForecast,
  chatGemini,
  getItinerary,
  broadcastStaffAlert,
} from '../src/services/api';

jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
    ...instance,
  };
});

// Get the mocked instance
const mockAxios = jest.requireMock('axios') as {
  get: jest.MockedFunction<typeof axios.get>;
  post: jest.MockedFunction<typeof axios.post>;
};

describe('API service', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetchCrowdData returns crowd sections', async () => {
    const data = [{ section: '101', density: 'HIGH' }];
    mockAxios.get.mockResolvedValueOnce({ data });
    const result = await fetchCrowdData();
    expect(result).toEqual(data);
  });

  it('fetchQueueData returns queue items', async () => {
    const data = [{ id: 'gate-1', type: 'gate', waitTimeMinutes: 10 }];
    mockAxios.get.mockResolvedValueOnce({ data });
    const result = await fetchQueueData();
    expect(result).toEqual(data);
  });

  it('fetchCrowdForecast returns forecast string', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { forecast: 'Looks clear!' } });
    const result = await fetchCrowdForecast();
    expect(result).toBe('Looks clear!');
  });

  it('chatGemini posts message and returns reply', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { reply: 'Hello!' } });
    const result = await chatGemini('Hi there');
    expect(result).toBe('Hello!');
  });

  it('chatGemini clamps long messages', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { reply: 'ok' } });
    const longMsg = 'a'.repeat(600);
    await chatGemini(longMsg);
    const sentBody = mockAxios.post.mock.calls[0][1] as { message: string };
    expect(sentBody.message.length).toBeLessThanOrEqual(500);
  });

  it('getItinerary posts section and returns itinerary', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { itinerary: 'Arrive at 5pm...' } });
    const result = await getItinerary('101');
    expect(result).toBe('Arrive at 5pm...');
  });

  it('broadcastStaffAlert posts announcement with staff key header', async () => {
    mockAxios.post.mockResolvedValueOnce({});
    await broadcastStaffAlert('Emergency exit B');
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/staff/broadcast',
      expect.objectContaining({ announcement: 'Emergency exit B' }),
      expect.objectContaining({ headers: { 'X-Staff-Key': expect.any(String) } })
    );
  });
});
