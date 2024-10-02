import { ISession } from '../../store/models/Session';
import apiClient from '../AxiosService';

export const getActiveSession = async (): Promise<{ data?: ISession; message?: string; keyMissing?: boolean }> => {
  try {
    const response = await apiClient.post('session');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch active session', error);
    throw error;
  }
};

export const changeSessionAssistant = async (
  sessionId: string,
  assistantId: string
): Promise<ISession> => {
  try {
    const response = await apiClient.put(`session/${sessionId}/assistant`, {
      assistantId,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Failed to change assistant for session ${sessionId}`,
      error
    );
    throw error;
  }
};

export const changeSessionLanguage = async (sessionId: string, language: string): Promise<ISession> => {
  try {
    const response = await apiClient.put(`/session/${sessionId}/language`, { language });
    return response.data;
  } catch (error) {
    console.error(`Failed to change language for session ${sessionId}`, error);
    throw error;
  }
};

export const getSessionById = async (sessionId: string): Promise<ISession> => {
  try {
    const response = await apiClient.get(`session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch session with id ${sessionId}`, error);
    throw error;
  }
};

export const endSession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.delete(`session/${sessionId}`);
  } catch (error) {
    console.error(`Failed to end session with id ${sessionId}`, error);
    throw error;
  }
};