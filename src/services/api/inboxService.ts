import apiClient from '../AxiosService';
import { IInboxSession } from '../../store/models/Inbox';
import { singleFlight } from '../../utils/singleFlight';

export const getInboxMessages = (): Promise<IInboxSession[]> =>
  singleFlight('GET /inbox', () =>
    apiClient.get('inbox').then((res) => res.data)
  );

export const addInboxMessage = async (sessionId: string, message: string): Promise<IInboxSession> => {
  try {
    const response = await apiClient.post(`inbox/${sessionId}`, { message });
    return response.data;
  } catch (error) {
    console.error('Failed to add inbox message', error);
    throw error;
  }
};

export const addInboxResponse = async (sessionId: string, message: string, inboxMessageId: string): Promise<IInboxSession> => {
  try {
    const response = await apiClient.post(`inbox/reply/${sessionId}`, { message, inboxMessageId });
    return response.data;
  } catch (error) {
    console.error('Failed to add inbox response', error);
    throw error;
  }
};
