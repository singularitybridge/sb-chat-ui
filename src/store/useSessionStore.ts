import { create } from 'zustand';
import {
  getActiveSession,
  changeSessionAssistant,
  endSession,
  clearActiveSession as clearActiveSessionService,
} from '../services/api/sessionService';

// Copied from src/store/models/Session.ts and adapted for plain object
export interface ISession {
  _id: string;
  assistantId: string;
  language: string; // Assuming 'en' is a default, but it's required here
}

interface SessionStoreState {
  activeSession: ISession | null;
  activeDialog: string;
  isApiKeyMissing: boolean;
  isLoadingSession: boolean; // To track loading state for async operations

  fetchActiveSession: () => Promise<void>;
  changeAssistant: (assistantId: string) => Promise<void>;
  endActiveSession: () => Promise<void>;
  clearActiveSessionLocally: () => void; // Renamed to avoid conflict if clearActiveSession is used for API call
  clearAndRenewActiveSession: () => Promise<ISession | null>;
  showDialog: (dialogName: string) => void;
  isDialogOpen: (dialogName: string) => boolean;
  setActiveSession: (session: ISession | null) => void; // Added for direct setting if needed
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeSession: null,
  activeDialog: '',
  isApiKeyMissing: false,
  isLoadingSession: false,

  fetchActiveSession: async () => {
    set({ isLoadingSession: true });
    try {
      const response = await getActiveSession();
      
      console.log('fetchActiveSession - response:', response);
      
      // Type guard to check if response is ISession
      const isSession = (obj: any): obj is ISession => {
        return obj && 
               typeof obj._id === 'string' && 
               typeof obj.assistantId === 'string';
      };
      
      // Check if the response is the session directly
      if (isSession(response)) {
        // Direct session response
        const sessionData: ISession = {
          _id: response._id,
          assistantId: response.assistantId,
          language: response.language || 'en', 
        };
        console.log('fetchActiveSession - setting activeSession (direct):', sessionData);
        set({ activeSession: sessionData, isApiKeyMissing: false, isLoadingSession: false });
      } 
      // Check for wrapped response
      else if (response && response.data && isSession(response.data)) {
        // Wrapped session response
        const sessionData: ISession = {
          _id: response.data._id,
          assistantId: response.data.assistantId,
          language: response.data.language || 'en', 
        };
        console.log('fetchActiveSession - setting activeSession (wrapped):', sessionData);
        set({ activeSession: sessionData, isApiKeyMissing: false, isLoadingSession: false });
      } 
      // Check for API key missing
      else if (response && response.keyMissing) { 
        set({ activeSession: null, isApiKeyMissing: true, isLoadingSession: false });
        console.log(response.message || 'API key is missing');
      } 
      // Unexpected response
      else {
        console.error('Unexpected response format or missing data from getActiveSession', response);
        set({ activeSession: null, isLoadingSession: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch active session', error);
      set({ activeSession: null, isApiKeyMissing: false, isLoadingSession: false });
      if (error.response && error.response.status >= 400) {
        console.log(`Error fetching active session: ${error.response.data?.message || error.message}`);
      }
    }
  },

  changeAssistant: async (assistantId: string) => {
    const currentSession = get().activeSession;
    console.log('changeAssistant - currentSession:', currentSession);
    console.log('changeAssistant - assistantId:', assistantId);
    
    if (!currentSession) {
      console.error('No active session to change assistant');
      return;
    }
    set({ isLoadingSession: true });
    try {
      const updatedSessionData = await changeSessionAssistant(currentSession._id, assistantId);
      console.log('changeAssistant - updatedSessionData:', updatedSessionData);
      // Assuming updatedSessionData is ISession compatible
      set(state => ({ 
        activeSession: state.activeSession ? { ...state.activeSession, assistantId: updatedSessionData.assistantId } : null,
        isLoadingSession: false 
      }));
    } catch (error) {
      console.error('Failed to change assistant', error);
      set({ isLoadingSession: false });
    }
  },

  endActiveSession: async () => {
    const currentSession = get().activeSession;
    if (!currentSession) {
      console.error('No active session to end');
      return;
    }
    set({ isLoadingSession: true });
    try {
      await endSession(currentSession._id);
      set({ activeSession: null, isLoadingSession: false });
    } catch (error) {
      console.error('Failed to end session', error);
      set({ isLoadingSession: false });
    }
  },

  clearActiveSessionLocally: () => {
    set({ activeSession: null });
  },

  clearAndRenewActiveSession: async () => {
    set({ isLoadingSession: true });
    try {
      const newSession = await clearActiveSessionService();
      if (newSession && newSession._id) {
        set({ activeSession: newSession as ISession, isApiKeyMissing: false, isLoadingSession: false });
        return newSession as ISession;
      } else {
        console.error('Failed to get new session details from clearActiveSessionService');
        set({ activeSession: null, isLoadingSession: false });
        return null;
      }
    } catch (error) {
      console.error('Failed to clear and renew session', error);
      set({ activeSession: null, isLoadingSession: false });
      return null;
    }
  },

  showDialog: (dialogName: string) => {
    set({ activeDialog: dialogName });
  },

  isDialogOpen: (dialogName: string) => {
    return get().activeDialog === dialogName;
  },
  
  setActiveSession: (session: ISession | null) => {
    set({ activeSession: session });
  }
}));
