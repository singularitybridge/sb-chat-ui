import { create } from 'zustand';
import {
  getActiveSessionMessages,
} from '../services/api/sessionService';
import { ISession } from './useSessionStore';
import { 
  handleUserInputStream,
  StreamPayload 
} from '../services/api/assistantService';
import { emitter } from '../services/mittEmitter';
import { EVENT_CHAT_SESSION_DELETED, EVENT_SET_ACTIVE_ASSISTANT } from '../utils/eventNames';
import { TTSVoice } from '../services/api/voiceService';
import { useSessionStore } from './useSessionStore';
import i18n from '../i18n';
import { 
  ChatMessage, 
  ApiResponseMessage, 
  AssistantInfo,
  Metadata 
} from '../types/chat';
import { useAudioStore } from './useAudioStore';
import { messageCache } from '../utils/messageCache';
import { logger } from '../services/LoggingService';

// Helper function (can be moved to utils)
const removeRAGCitations = (text: string): string => {
  return text.replace(/【\d+:\d+†source】/g, '');
};

interface ChatStoreState {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  abortController: AbortController | null;
  
  loadMessages: (activeSessionId: string | null | undefined) => Promise<void>;
  addPusherMessage: (pusherMessage: any, assistantId?: string) => void;
  
  handleSubmitMessage: (
    messageText: string, 
    assistant: AssistantInfo | undefined,
    activeSessionId: string | null | undefined
  ) => Promise<void>;
  
  handleClearChat: (
    activeSessionId: string | null | undefined, 
    assistantId: string | null | undefined,
    clearAndRenewActiveSession: () => Promise<ISession | null>
  ) => Promise<void>;

  updateActionExecutionMessage: (actionData: any) => void;
  
  _mapToChatMessage: (apiMessage: ApiResponseMessage) => ChatMessage;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  abortController: null,

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
      // Check cache first
      const cachedMessages = messageCache.get(activeSessionId);
      if (cachedMessages) {
        set({ messages: cachedMessages, isLoadingMessages: false });
        return;
      }

      set({ isLoadingMessages: true });
      try {
        const sessionApiMessages: ApiResponseMessage[] = await getActiveSessionMessages();
        const chatMessages = sessionApiMessages.map(get()._mapToChatMessage).reverse();
        
        // Cache the messages
        messageCache.set(activeSessionId, chatMessages);
        
        set({ messages: chatMessages, isLoadingMessages: false });
      } catch (error: any) {
        logger.error('Failed to load messages for active session', error);
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
      assistantName: pusherMessage.type === 'assistant' && assistantId ? assistantId : undefined
    };
    
    set((state) => {
      const updatedMessages = [...state.messages, newMessage];
      // Invalidate cache since we have new messages
      const activeSessionId = useSessionStore.getState().activeSession?._id;
      if (activeSessionId) {
        messageCache.invalidate(activeSessionId);
      }
      return { messages: updatedMessages };
    });
    
    if (pusherMessage.type === 'user') {
      set({ isLoading: true });
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
    set((state) => {
      const updatedMessages = [...state.messages, userMessage];
      // Invalidate cache when adding new messages
      if (activeSessionId) {
        messageCache.invalidate(activeSessionId);
      }
      return { messages: updatedMessages, isLoading: true };
    });

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
                      logger.debug('Stream: Action payload received', payload.actionDetails);
                      newContent += `\n[Action: ${payload.actionDetails?.actionTitle || 'Processing Action'}]`;
                      newMetadata = { ...newMetadata, message_type: 'action_stream', actionDetails: payload.actionDetails };
                      break;
                    case 'error':
                      logger.error('Stream: Error payload received', undefined, payload.errorDetails);
                      newContent += `\n[Error: ${payload.errorDetails?.message || 'Streaming error'}]`;
                      newIsStreaming = false;
                      set({ isLoading: false });
                      break;
                    case 'done':
                      newIsStreaming = false;
                      set({ isLoading: false });
                      newContent = removeRAGCitations(newContent);
                      
                      // Play audio if enabled and voice is available and valid
                      if (newContent.trim() && assistant.voice && ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(assistant.voice as TTSVoice)) {
                        const audioStore = useAudioStore.getState();
                        audioStore.playText(newContent, assistant.voice as TTSVoice).catch(error => 
                          logger.error('Failed to play audio for streamed response', error)
                        );
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
          logger.error('Error getting assistant response stream', error);
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
        
        // Clear messages and invalidate cache
        if (activeSessionId) {
          messageCache.invalidate(activeSessionId);
        }
        set({ messages: [] });

        if (newSession?.assistantId) {
           emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, newSession.assistantId);
        } else {
            emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantId);
        }

      } catch (error: any) {
        logger.error('Error in handleClearChat', error);
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
