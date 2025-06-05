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

  fetchActiveSession: () => Promise<ISession | null>; // Modified to return ISession or null
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

  fetchActiveSession: async (): Promise<ISession | null> => { // Modified to return ISession or null
    set({ isLoadingSession: true });
    let sessionToReturn: ISession | null = null; // Variable to hold the session to be returned
    try {
      const response = await retry(() => getActiveSession());

      // Type guard to check if response is ISession (or can be coerced into one)
      const isSessionLike = (obj: any): obj is Partial<ISession> & { _id: string; assistantId: string } => {
        return obj && 
               typeof obj._id === 'string' && 
               typeof obj.assistantId === 'string';
      };
      
      // Check if the response is the session directly
      if (isSessionLike(response)) {
        const sessionData: ISession = {
          _id: response._id,
          assistantId: response.assistantId,
          language: response.language || 'en', // Default language if not present
        };
        // Use the robust setActiveSession which validates and defaults language
        get().setActiveSession(sessionData);
        sessionToReturn = sessionData; // Set session to return
        set({ isApiKeyMissing: false, isLoadingSession: false });
      }
      // Check for wrapped response
      else if (response && response.data && isSessionLike(response.data)) {
        const sessionData: ISession = {
          _id: response.data._id,
          assistantId: response.data.assistantId,
          language: response.data.language || 'en', // Default language
        };
        // Use the robust setActiveSession
        get().setActiveSession(sessionData);
        sessionToReturn = sessionData; // Set session to return
        set({ isApiKeyMissing: false, isLoadingSession: false });
      }
      // Check for API key missing
      else if (response && response.keyMissing) {
        set({ activeSession: null, isApiKeyMissing: true, isLoadingSession: false });
        sessionToReturn = null;
      }
      // Unexpected response
      else {
        logger.error('Unexpected response format from getActiveSession', undefined, response);
        set({ activeSession: null, isLoadingSession: false });
        sessionToReturn = null;
      }
    } catch (error: any) {
      logger.error('Failed to fetch active session', error);
      set({ activeSession: null, isApiKeyMissing: false, isLoadingSession: false });
      sessionToReturn = null;
    }
    return sessionToReturn; // Return the fetched session or null
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
    if (session === null) {
      set({ activeSession: null });
    } else {
      // Validate the session object before setting
      // Re-use the isSession type guard logic or a similar check
      const isValidSession = (s: any): s is ISession => 
        s && typeof s._id === 'string' && s._id.length > 0 && // Ensure _id is not an empty string
               typeof s.assistantId === 'string' && 
               typeof s.language === 'string';

      if (isValidSession(session)) {
        set({ activeSession: session });
      } else {
        const s = session as any; 
        // Check if it's a potentially valid session missing only language or having an empty _id
        if (s && typeof s._id === 'string' && typeof s.assistantId === 'string') {
          if (s._id.length === 0) {
            logger.warn('Attempted to set a session with an empty _id. Setting activeSession to null instead.', { sessionDetails: s });
            set({ activeSession: null });
          } else if (typeof s.language !== 'string' || s.language.length === 0) {
            logger.warn('Session object missing or has empty language, defaulting to "en".', { sessionDetails: s });
            const validSessionWithDefaultLanguage: ISession = { 
              _id: s._id, 
              assistantId: s.assistantId, 
              language: 'en' 
            };
            set({ activeSession: validSessionWithDefaultLanguage });
          } else {
            // This case should ideally not be hit if isValidSession is comprehensive
            logger.warn('Attempted to set an invalid session object (unknown reason). Setting activeSession to null instead.', { sessionDetails: s });
            set({ activeSession: null });
          }
        } else {
          logger.warn('Attempted to set a fundamentally invalid session object. Setting activeSession to null instead.', { sessionDetails: s });
          set({ activeSession: null });
        }
      }
    }
  }
}));
