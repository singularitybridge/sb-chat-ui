import { create } from 'zustand';
import {
  getActiveSession,
  changeSessionAssistant,
  endSession,
  clearActiveSession as clearActiveSessionService,
} from '../services/api/sessionService';
import { logger } from '../services/LoggingService';

// Retry utility for session operations
const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
};

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
      const response = await retry(() => getActiveSession());
      
      // Type guard to check if response is ISession
      const isSession = (obj: any): obj is ISession => {
        return obj && 
               typeof obj._id === 'string' && 
               typeof obj.assistantId === 'string';
      };
      
      // Check if the response is the session directly
      if (isSession(response)) {
        const sessionData: ISession = {
          _id: response._id,
          assistantId: response.assistantId,
          language: response.language || 'en', 
        };
        set({ activeSession: sessionData, isApiKeyMissing: false, isLoadingSession: false });
      } 
      // Check for wrapped response
      else if (response && response.data && isSession(response.data)) {
        const sessionData: ISession = {
          _id: response.data._id,
          assistantId: response.data.assistantId,
          language: response.data.language || 'en', 
        };
        set({ activeSession: sessionData, isApiKeyMissing: false, isLoadingSession: false });
      } 
      // Check for API key missing
      else if (response && response.keyMissing) { 
        set({ activeSession: null, isApiKeyMissing: true, isLoadingSession: false });
      } 
      // Unexpected response
      else {
        logger.error('Unexpected response format from getActiveSession', undefined, response);
        set({ activeSession: null, isLoadingSession: false });
      }
    } catch (error: any) {
      logger.error('Failed to fetch active session', error);
      set({ activeSession: null, isApiKeyMissing: false, isLoadingSession: false });
    }
  },

  changeAssistant: async (assistantId: string) => {
    const currentSession = get().activeSession;
    
    if (!currentSession) {
      logger.warn('No active session to change assistant');
      return;
    }
    
    // Optimistic update
    const previousAssistantId = currentSession.assistantId;
    set(state => ({ 
      activeSession: state.activeSession ? { ...state.activeSession, assistantId } : null,
      isLoadingSession: true 
    }));
    
    try {
      const updatedSessionData = await changeSessionAssistant(currentSession._id, assistantId);
      set(state => ({ 
        activeSession: state.activeSession ? { ...state.activeSession, assistantId: updatedSessionData.assistantId } : null,
        isLoadingSession: false 
      }));
    } catch (error: any) {
      logger.error('Failed to change assistant', error);
      // Rollback on error
      set(state => ({ 
        activeSession: state.activeSession ? { ...state.activeSession, assistantId: previousAssistantId } : null,
        isLoadingSession: false 
      }));
      throw error; // Re-throw to allow UI to handle error
    }
  },

  endActiveSession: async () => {
    const currentSession = get().activeSession;
    if (!currentSession) {
      logger.warn('No active session to end');
      return;
    }
    
    set({ isLoadingSession: true });
    try {
      await endSession(currentSession._id);
      set({ activeSession: null, isLoadingSession: false });
    } catch (error: any) {
      logger.error('Failed to end session', error);
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
        logger.error('Failed to get new session details from clearActiveSessionService');
        set({ activeSession: null, isLoadingSession: false });
        return null;
      }
    } catch (error: any) {
      logger.error('Failed to clear and renew session', error);
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
