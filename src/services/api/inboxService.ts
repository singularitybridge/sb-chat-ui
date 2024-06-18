import axios from 'axios';
import { IInboxSession } from '../../store/models/Inbox';
import apiClient from '../AxiosService';

export const getInboxMessages = async (companyId: string) : Promise<IInboxSession[]> => {
  try {
    const response = await apiClient.get(`inbox/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inbox messages', error);
    throw error;
  }
};

export const addInboxMessage = async (sessionId: string, message: string) : Promise<IInboxSession> => {
  try {
    const response = await apiClient.post(`inbox/${sessionId}`, { message });
    return response.data;
  } catch (error) {
    console.error('Failed to add inbox message', error);
    throw error;
  }
};


export const addInboxResponse = async (sessionId: string, message: string) : Promise<IInboxSession> => {
  try {
    const response = await apiClient.post(`inbox/reply/${sessionId}`, { message });
    return response.data;
  } catch (error) {
    console.error('Failed to add inbox response', error);
    throw error;
  }
};
