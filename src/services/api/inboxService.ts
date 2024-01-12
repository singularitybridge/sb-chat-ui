import axios from 'axios';
import { IInbox } from '../../store/models/Inbox';

export const getInboxMessages = async (sessionId: string) : Promise<IInbox[]> => {
  try {
    const response = await axios.get(`http://localhost:3000/inbox/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inbox messages', error);
    throw error;
  }
};

export const addInboxMessage = async (sessionId: string, message: string) : Promise<IInbox> => {
  try {
    const response = await axios.post(`http://localhost:3000/inbox/${sessionId}`, { message });
    return response.data;
  } catch (error) {
    console.error('Failed to add inbox message', error);
    throw error;
  }
};
