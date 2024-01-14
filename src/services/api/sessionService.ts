import axios from 'axios';
import { ISession } from '../../store/models/Session';

export const LOCALSTORAGE_SESSION_ID = 'sessionId';
export const LOCALSTORAGE_USER_ID = 'userId';
export const LOCALSTORAGE_COMPANY_ID = 'companyId';
export const LOCALSTORAGE_ASSISTANT_ID = 'assistantId';

// define a type for the different keys of the localStorage
export type LocalStorageKeys =
  | typeof LOCALSTORAGE_SESSION_ID
  | typeof LOCALSTORAGE_USER_ID
  | typeof LOCALSTORAGE_COMPANY_ID
  | typeof LOCALSTORAGE_ASSISTANT_ID;



export const getLocalStorageItem = (key: LocalStorageKeys): string | null => {
  return localStorage.getItem(key);
}

export const setLocalStorageItem = (key: LocalStorageKeys, value: string): void => {
  return localStorage.setItem(key, value);
}

export const updateSessionAssistant = async (
  sessionId: string,
  assistantId: string
): Promise<void> => {
  try {
    await axios.put(`http://localhost:3000/session/${sessionId}`, {
      assistantId,
    });
  } catch (error) {
    console.error(`Failed to update assistant for session with id ${sessionId}`, error);
    throw error;
  }
};


export const updateSession = async (
  userId: string,
  companyId: string,
  assistantId?: string
): Promise<ISession> => {
  try {
    const response = await axios.post('http://localhost:3000/session', {
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
    const response = await axios.get(`http://localhost:3000/session/friendly/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sessions', error);
    throw error;
  }
};

export const getSessionById = async (sessionId: string): Promise<ISession> => {
  try {
    const response = await axios.get(
      `http://localhost:3000/session/${sessionId}`
    );
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
