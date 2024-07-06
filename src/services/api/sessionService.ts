import { ISession } from '../../store/models/Session';
import apiClient from '../AxiosService';

export const LOCALSTORAGE_USER_ID = 'userId';
export const LOCALSTORAGE_COMPANY_ID = 'companyId';
export const LOCALSTORAGE_SYSTEM_USER_ID = 'systemUserId';

export type LocalStorageKeys =
  | typeof LOCALSTORAGE_USER_ID
  | typeof LOCALSTORAGE_COMPANY_ID
  | typeof LOCALSTORAGE_SYSTEM_USER_ID;

export const getLocalStorageItem = (key: LocalStorageKeys): string | null => {
  return localStorage.getItem(key);
}

export const setLocalStorageItem = (key: LocalStorageKeys, value: string): void => {
  return localStorage.setItem(key, value);
}

export const getCompanyId = (): string | null => {
  return getLocalStorageItem(LOCALSTORAGE_COMPANY_ID);
};

export const getUserId = (): string | null => {
  return getLocalStorageItem(LOCALSTORAGE_USER_ID);
};

export const getSystemUserId = (): string | null => {
  return getLocalStorageItem(LOCALSTORAGE_USER_ID);
};

export const setCompanyId = (companyId: string): void => {
  setLocalStorageItem(LOCALSTORAGE_COMPANY_ID, companyId);
};

export const setUserId = (userId: string): void => {
  setLocalStorageItem(LOCALSTORAGE_USER_ID, userId);
};

export const setSystemUserId = (userId: string): void => {
  setLocalStorageItem(LOCALSTORAGE_USER_ID, userId);
};

export const updateSessionAssistant = async (
  sessionId: string,
  assistantId: string
): Promise<void> => {  
  try {
    await apiClient.put(`session/${sessionId}`, {
      assistantId,
    });
  } catch (error) {
    console.error(`Failed to update assistant for session with id ${sessionId}`, error);
    throw error;
  }
};


export const createSession = async (
  userId: string,
  companyId: string,
  assistantId?: string
): Promise<ISession> => {
  try {    
    const response = await apiClient.post('session', {
      userId,
      companyId,
      assistantId,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update session for user ${userId} and company ${companyId}`,
      error
    );
    throw error;
  }
};

export const getAllSessions = async (companyId: string): Promise<ISession[]> => {
  try {
    const response = await apiClient.get(`session/friendly/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sessions', error);
    throw error;
  }
};

export const getSessionByCompanyAndUserId = async (
  companyId: string,
  userId: string
): Promise<ISession> => {
  try {
    const response = await apiClient.get(
      `session/${companyId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch session for user ${userId} and company ${companyId}`,
      error
    );
    throw error;
  }
}

export const getSessionById = async (sessionId: string): Promise<ISession> => {  
  try {
    const response = await apiClient.get(
      `session/${sessionId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch session with id ${sessionId}`, error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.delete(`session/${sessionId}`);
  } catch (error) {
    console.error(`Failed to delete session with id ${sessionId}`, error);
    throw error;
  }
};
