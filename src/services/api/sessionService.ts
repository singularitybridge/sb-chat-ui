import axios from 'axios';
import { ISession } from '../../store/models/Session';

export const getAllSessions = async (): Promise<ISession[]> => {
  try {
    const response = await axios.get('http://localhost:3000/session/friendly');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sessions', error);
    throw error;
  }
};

export const getSessionById = async (sessionId: string): Promise<ISession> => {
  try {
    const response = await axios.get(`http://localhost:3000/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch session with id ${sessionId}`, error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await axios.delete(`http://localhost:3000/session/${sessionId}`);
  } catch (error) {
    console.error(`Failed to delete session with id ${sessionId}`, error);
    throw error;
  }
};
