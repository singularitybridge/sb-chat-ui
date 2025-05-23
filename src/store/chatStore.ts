import { create } from 'zustand';
import {
  getActiveSessionMessages,
} from '../services/api/sessionService';
import { ISession } from './useSessionStore'; // Updated import
import { 
  handleUserInputStream,
  StreamPayload 
} from '../services/api/assistantService';
import { textToSpeech, TTSVoice } from '../services/api/voiceService';
import { emitter } from '../services/mittEmitter';
import { EVENT_CHAT_SESSION_DELETED, EVENT_SET_ACTIVE_ASSISTANT } from '../utils/eventNames';
import i18n from '../i18n'; // Assuming i18n is configured for translations

// Interfaces from ChatContainer.tsx (can be moved to a types file)
interface Metadata {
  message_type: string;
  [key: string]: any;
}

interface ApiResponseMessageContentItemText {
  value: string;
}

interface ApiResponseMessageContentItem {
  type: 'text';
  text: ApiResponseMessageContentItemText;
}

interface ApiResponseMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: ApiResponseMessageContentItem[];
  created_at: number;
  assistant_id?: string;
  thread_id?: string;
  message_type: string;
  data?: { [key: string]: any };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: string;
  metadata?: Metadata;
  assistantName?: string;
  createdAt: number;
  isStreaming?: boolean;
}

// Helper function (can be moved to utils)
const removeRAGCitations = (text: string): string => {
  return text.replace(/【\d+:\d+†source】/g, '');
};

interface ChatStoreState {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMessages: boolean; // For initial load
  audioState: 'disabled' | 'enabled' | 'playing';
  audioRef: React.RefObject<HTMLAudioElement> | null; // To control audio playback
  abortController: AbortController | null;

  setAudioRef: (ref: React.RefObject<HTMLAudioElement>) => void;
  toggleAudio: () => void;
  
  loadMessages: (activeSessionId: string | null | undefined) => Promise<void>;
  addPusherMessage: (pusherMessage: any, assistantId?: string) => void; // Define PusherChatMessage type if available
  
  handleSubmitMessage: (
    messageText: string, 
    assistant: { _id: string; voice?: string; name?: string } | undefined, // Simplified assistant type
    activeSessionId: string | null | undefined
    // rootStoreLanguage: string // Removed as it's not used
  ) => Promise<void>;
  
  handleClearChat: (
    activeSessionId: string | null | undefined, 
    assistantId: string | null | undefined,
    clearAndRenewActiveSessionMST: () => Promise<ISession | null> // Changed type to ISession
    ) => Promise<void>;

  updateActionExecutionMessage: (actionData: any) => void; // Define ActionExecutionMessage type
  
  // Internal helper, not typically called directly from component
  _mapToChatMessage: (apiMessage: ApiResponseMessage) => ChatMessage;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  audioState: 'disabled',
  audioRef: null,
  abortController: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  toggleAudio: () => {
    const { audioState, audioRef } = get();
    if (audioState === 'disabled') {
      set({ audioState: 'enabled' });
    } else if (audioState === 'enabled') {
      set({ audioState: 'disabled' });
    } else if (audioState === 'playing') {
      if (audioRef?.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      set({ audioState: 'enabled' });
    }
  },

  _mapToChatMessage: (apiMessage: ApiResponseMessage): ChatMessage => {
    const textValue = apiMessage.content?.[0]?.text?.value || 
                      (apiMessage.role === 'system' ? `System: ${apiMessage.message_type}` : 'No content available');
    
    const mappedMetadata: Metadata = {
      message_type: apiMessage.message_type,
      ...(apiMessage.data || {})
    };

    if (apiMessage.message_type === 'action_execution' && apiMessage.data?.id) {
      mappedMetadata.messageId = apiMessage.data.id;
    }
  
    return {
      id: apiMessage.id,
      content: removeRAGCitations(textValue),
      role: apiMessage.role,
      metadata: mappedMetadata,
      createdAt: apiMessage.created_at,
    };
  },

  loadMessages: async (activeSessionId) => {
    if (activeSessionId) {
      set({ isLoadingMessages: true });
      try {
        const sessionApiMessages: ApiResponseMessage[] = await getActiveSessionMessages();
        const chatMessages = sessionApiMessages.map(get()._mapToChatMessage).reverse();
        set({ messages: chatMessages, isLoadingMessages: false });
      } catch (error) {
        console.error('Failed to load messages for active session:', error);
        set({ messages: [], isLoadingMessages: false });
      }
    } else {
      set({ messages: [] });
    }
  },

  addPusherMessage: (pusherMessage, assistantId) => {
    const newMessage: ChatMessage = {
      id: `pusher-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      content: removeRAGCitations(pusherMessage.content),
      role: pusherMessage.type === 'assistant' ? 'assistant' : 'user',
      createdAt: new Date(pusherMessage.timestamp).getTime() / 1000,
      metadata: { message_type: 'text' },
      assistantName: pusherMessage.type === 'assistant' && assistantId ? assistantId : undefined // Or fetch assistant name
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    if (pusherMessage.type === 'user') {
      set({ isLoading: true }); // Set loading if user message comes via Pusher (e.g. from another client)
    }
  },
  
  handleSubmitMessage: async (messageText, assistant, activeSessionId) => {
    if (get().isLoading) return;

    if (get().abortController) {
      get().abortController?.abort();
    }
    const newAbortController = new AbortController();
    set({ abortController: newAbortController });

    const userMessageId = `local-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      content: messageText,
      role: 'user',
      createdAt: Date.now() / 1000,
      metadata: { message_type: 'text' },
    };
    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true }));

    const assistantMessageId = `streaming-assistant-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      createdAt: Date.now() / 1000,
      metadata: { message_type: 'text' },
      isStreaming: true,
      assistantName: assistant?.name,
    };
    set((state) => ({ messages: [...state.messages, initialAssistantMessage] }));

    if (assistant && activeSessionId) {
      try {
        await handleUserInputStream(
          { userInput: messageText /* sessionId removed */ },
          (payload: StreamPayload) => {
            set((state) => ({
              messages: state.messages.map((msg) => {
                if (msg.id === assistantMessageId) {
                  let newContent = msg.content;
                  let newMetadata = msg.metadata;
                  let newIsStreaming = msg.isStreaming;

                  switch (payload.type) {
                    case 'token':
                      newContent += payload.value || '';
                      break;
                    case 'markdown':
                      newContent += payload.value || '';
                      newMetadata = { ...newMetadata, message_type: 'markdown_stream' };
                      break;
                    case 'action':
                      console.log('Stream: Action payload received', payload.actionDetails);
                      newContent += `\n[Action: ${payload.actionDetails?.actionTitle || 'Processing Action'}]`;
                      newMetadata = { ...newMetadata, message_type: 'action_stream', actionDetails: payload.actionDetails };
                      break;
                    case 'error':
                      console.error('Stream: Error payload received', payload.errorDetails);
                      newContent += `\n[Error: ${payload.errorDetails?.message || 'Streaming error'}]`;
                      newIsStreaming = false;
                      set({ isLoading: false });
                      break;
                    case 'done':
                      newIsStreaming = false;
                      set({ isLoading: false });
                      newContent = removeRAGCitations(newContent);
                      
                      if (get().audioState === 'enabled' && newContent.trim() && assistant.voice) {
                        textToSpeech(newContent, assistant.voice as TTSVoice)
                          .then(audioUrl => {
                            const audioRefCurrent = get().audioRef?.current;
                            if (audioRefCurrent) {
                              audioRefCurrent.src = audioUrl;
                              audioRefCurrent.play();
                              set({ audioState: 'playing' });
                            }
                          })
                          .catch(ttsError => console.error('Failed to play audio for streamed response:', ttsError));
                      }
                      break;
                  }
                  return { ...msg, content: newContent, metadata: newMetadata, isStreaming: newIsStreaming };
                }
                return msg;
              }),
            }));
          },
          newAbortController.signal
        );
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error getting assistant response stream:', error);
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: `${msg.content}\n[Error: Failed to get response]`, isStreaming: false }
                : msg
            ),
            isLoading: false,
          }));
        }
      }
    } else {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: '[Error: Assistant or session not available]', isStreaming: false }
            : msg
        ),
        isLoading: false,
      }));
    }
  },

  handleClearChat: async (activeSessionId, assistantId, clearAndRenewActiveSessionMST) => {
    if (get().abortController) {
      get().abortController?.abort();
      set({ abortController: null });
    }
    if (activeSessionId && assistantId) {
      try {
        const newSession = await clearAndRenewActiveSessionMST(); // Call the MST action
        
        emitter.emit(
          EVENT_CHAT_SESSION_DELETED,
          i18n.t('Notifications.sessionClearedAndNewStarted')
        );
        
        set({ messages: [] }); // Clear messages in Zustand store

        if (newSession?.assistantId) {
           emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, newSession.assistantId);
        } else {
            emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantId);
        }

      } catch (error) {
        console.error('Error in handleClearChat:', error);
      }
    }
  },

  updateActionExecutionMessage: (actionData) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.metadata?.message_type === 'action_execution' && msg.metadata?.messageId === actionData.messageId) {
          return {
            ...msg,
            metadata: {
              ...(msg.metadata || { message_type: 'action_execution' }),
              ...actionData,
              message_type: 'action_execution',
            },
          };
        }
        return msg;
      // If not found, and we need to add it as a new message:
      // This part depends on whether action_execution always updates an existing placeholder
      // or can arrive as a new system message. For now, assuming it updates.
      // If it can be new, an else block similar to addPusherMessage would be needed.
      }),
    }));
  },
}));

// Initialize audioRef event listener (this is a bit tricky with Zustand, might need to be in component)
// For now, assuming audioRef.current.onended is set in the component where audioRef is created.
