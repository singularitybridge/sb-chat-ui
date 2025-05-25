import { create } from 'zustand';
import {
  getInboxMessages,
  addInboxMessage,
  addInboxResponse,
} from '../services/api/inboxService';
import { logger } from '../services/LoggingService';

export type MessageType = 'human_agent_request' | 'human_agent_response' | 'notification';

export interface Message {
  _id: string;
  message: string;
  createdAt: string | null;
  sessionActive: boolean;
  assistantName: string | null;
  senderId: string | null;
  type: MessageType;
}

export interface InboxSession {
  sessionId: string;
  messages: Message[];
  userName: string;
  lastMessageAt: string | null;
}

interface InboxStoreState {
  inboxSessions: InboxSession[];
  inboxSessionsLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  loadInboxSessions: () => Promise<void>;
  addMessage: (sessionId: string, message: string) => Promise<void>;
  addResponse: (sessionId: string, messageId: string, response: string) => Promise<void>;
  
  // Getters
  getSessionById: (sessionId: string) => InboxSession | undefined;
  getActiveRequests: () => Message[];
  getSessionMessages: (sessionId: string) => Message[];
}

export const useInboxStore = create<InboxStoreState>((set, get) => ({
  inboxSessions: [],
  inboxSessionsLoaded: false,
  isLoading: false,
  
  loadInboxSessions: async () => {
    set({ isLoading: true });
    try {
      const response = await getInboxMessages();
      // Transform the response to match our InboxSession structure
      const sessionsMap = new Map<string, InboxSession>();
      
      response.forEach((msg: any) => {
        const sessionId = msg.sessionId;
        if (!sessionsMap.has(sessionId)) {
          sessionsMap.set(sessionId, {
            sessionId,
            messages: [],
            userName: msg.userName || '',
            lastMessageAt: null,
          });
        }
        
        const session = sessionsMap.get(sessionId)!;
        session.messages.push({
          _id: msg._id,
          message: msg.message,
          createdAt: msg.createdAt,
          sessionActive: msg.sessionActive,
          assistantName: msg.assistantName,
          senderId: msg.senderId,
          type: msg.type,
        });
        
        // Update lastMessageAt
        if (msg.createdAt && (!session.lastMessageAt || new Date(msg.createdAt) > new Date(session.lastMessageAt))) {
          session.lastMessageAt = msg.createdAt;
        }
      });
      
      const inboxSessions = Array.from(sessionsMap.values());
      set({ 
        inboxSessions, 
        inboxSessionsLoaded: true,
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load inbox sessions', error);
      set({ inboxSessionsLoaded: true, isLoading: false });
      throw error;
    }
  },
  
  addMessage: async (sessionId, message) => {
    set({ isLoading: true });
    try {
      const newMessage = await addInboxMessage(sessionId, message);
      
      set(state => {
        const sessionIndex = state.inboxSessions.findIndex(s => s.sessionId === sessionId);
        const updatedSessions = [...state.inboxSessions];
        
        if (sessionIndex >= 0) {
          const currentSession = updatedSessions[sessionIndex];
          updatedSessions[sessionIndex] = {
            ...currentSession,
            messages: [...currentSession.messages, newMessage as unknown as Message],
            lastMessageAt: (newMessage as any).createdAt,
          };
        } else {
          // Create new session if it doesn't exist
          updatedSessions.push({
            sessionId,
            messages: [newMessage as unknown as Message],
            userName: '', // Consider how to get userName if session is new
            lastMessageAt: (newMessage as any).createdAt,
          });
        }
        
        return { inboxSessions: updatedSessions, isLoading: false };
      });
    } catch (error) {
      logger.error('Failed to add inbox message', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  addResponse: async (sessionId, messageId, response) => {
    set({ isLoading: true });
    try {
      const responseMessage = await addInboxResponse(sessionId, messageId, response);
      
      set(state => {
        const sessionIndex = state.inboxSessions.findIndex(s => s.sessionId === sessionId);
        if (sessionIndex >= 0) {
          const updatedSessions = [...state.inboxSessions];
          const currentSession = updatedSessions[sessionIndex];
          updatedSessions[sessionIndex] = {
            ...currentSession,
            messages: [...currentSession.messages, responseMessage as unknown as Message],
            lastMessageAt: (responseMessage as any).createdAt,
          };
          return { inboxSessions: updatedSessions, isLoading: false };
        }
        return { isLoading: false };
      });
    } catch (error) {
      logger.error('Failed to add inbox response', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getSessionById: (sessionId) => {
    return get().inboxSessions.find(s => s.sessionId === sessionId);
  },
  
  getActiveRequests: () => {
    const allMessages: Message[] = [];
    get().inboxSessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.type === 'human_agent_request' && msg.sessionActive) {
          allMessages.push(msg);
        }
      });
    });
    return allMessages;
  },
  
  getSessionMessages: (sessionId) => {
    const session = get().getSessionById(sessionId);
    return session ? session.messages : [];
  },
}));
