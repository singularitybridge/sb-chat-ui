import apiClient from '../AxiosService';
import { IInboxSession } from '../../store/models/Inbox';

export const getInboxMessages = async (): Promise<IInboxSession[]> => {
  try {
    const response = await apiClient.get(`inbox/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inbox messages', error);
    throw error;
  }
};

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