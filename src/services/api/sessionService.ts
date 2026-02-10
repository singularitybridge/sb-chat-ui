import { ISession } from '../../store/useSessionStore'; // Updated import
import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';

export const getActiveSession = (): Promise<ISession | { data?: ISession; message?: string; keyMissing?: boolean }> =>
  singleFlight('POST /session', () => // This seems to be for creating a new session explicitly or getting an active one.
    apiClient.post('session').then((res) => res.data) // The guide implies user-input handles this, but this might be for an initial "ensure session" call.
  );

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

// Clear active session (ends current and starts a new one)
export const clearActiveSession = (): Promise<ISession> =>
  singleFlight('POST /session/clear', () =>
    apiClient.post('/session/clear').then((res) => res.data)
  );

// New function to get messages for the active session
export const getActiveSessionMessages = (): Promise<any> => // Replace 'any' with a proper Message interface if available
  singleFlight('GET /session/messages', () =>
    apiClient.get('/session/messages').then((res) => res.data)
  );

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
