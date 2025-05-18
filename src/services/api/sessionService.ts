import { ISession } from '../../store/models/Session';
import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';

export const getActiveSession = (): Promise<{ data?: ISession; message?: string; keyMissing?: boolean }> =>
  singleFlight('POST /session', () =>
    apiClient.post('session').then((res) => res.data)
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

export const changeSessionLanguage = (sessionId: string, language: string): Promise<ISession> =>
  singleFlight(`PUT /session/${sessionId}/language`, () =>
    apiClient
      .put(`/session/${sessionId}/language`, { language })
      .then((res) => res.data)
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
