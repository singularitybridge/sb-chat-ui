/// file_path= src/services/api/sessionService.ts
import { ISession } from '../../store/models/Session';
import apiClient from '../AxiosService';

export const LOCALSTORAGE_USER_ID = 'userId';
export const LOCALSTORAGE_COMPANY_ID = 'companyId';

export type LocalStorageKeys =
  | typeof LOCALSTORAGE_USER_ID
  | typeof LOCALSTORAGE_COMPANY_ID

export const getLocalStorageItem = (key: LocalStorageKeys): string | null => {
  return localStorage.getItem(key);
};

export const setLocalStorageItem = (
  key: LocalStorageKeys,
  value: string
): void => {
  localStorage.setItem(key, value);
};

export const getActiveSession = async (): Promise<ISession> => {
  try {
    const response = await apiClient.post('session');
    return response.data;
  } catch (error) {
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