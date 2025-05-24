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
  isClearing: boolean;
  clearedSessionId: string | null;
  newSessionFromClear: string | null;
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
  isClearing: false,
  clearedSessionId: null,
  newSessionFromClear: null,
  abortController: null,

  _mapToChatMessage: (apiMessage: ApiResponseMessage): ChatMessage => {
    const textValue = apiMessage.content?.[0]?.text?.value || 
                      (apiMessage.role === 'system' ? `System: ${apiMessage.message_type}` : 'No content available');
    
    const mappedMetadata: Metadata = {
      message_type: apiMessage.message_type,
      ...(apiMessage.data || {})
    };

    if (apiMessage.message_type === 'action_execution' && apiMessage.data?.messageId) {
      mappedMetadata.messageId = apiMessage.data.messageId;
      console.log('🎯 [CHAT_STORE] Mapping action_execution message from API:', {
        apiMessageId: apiMessage.id,
        dataMessageId: apiMessage.data.messageId,
        assignedMessageId: mappedMetadata.messageId,
        fullData: apiMessage.data
      });
    }

    const chatMessage = {
      id: apiMessage.id,
      content: removeRAGCitations(textValue),
      role: apiMessage.role,
      metadata: mappedMetadata,
      createdAt: apiMessage.created_at,
    };
  
    return chatMessage;
  },

  loadMessages: async (activeSessionId) => {
    // Skip loading messages if we're in the process of clearing
    if (get().isClearing) {
      console.log('🚫 [CHAT_STORE] Skipping loadMessages during clear operation');
      return;
    }

    // Skip loading messages for a session that was just created from a clear operation
    if (activeSessionId && activeSessionId === get().newSessionFromClear) {
      console.log('🚫 [CHAT_STORE] Skipping loadMessages for newly cleared session:', activeSessionId);
      set({ messages: [], isLoadingMessages: false });
      return;
    }

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
    // Clear the newSessionFromClear flag when we start receiving messages
    // This indicates the session is now active and can load messages normally
    if (get().newSessionFromClear) {
      console.log('🔄 [CHAT_STORE] Clearing newSessionFromClear flag as messages are being added');
      set({ newSessionFromClear: null });
    }

    // Handle different content types properly
    let content = '';
    if (typeof pusherMessage.content === 'string') {
      content = removeRAGCitations(pusherMessage.content);
    } else if (pusherMessage.content && Array.isArray(pusherMessage.content)) {
      // Handle content array format from API
      const textContent = pusherMessage.content.find((c: any) => c.type === 'text');
      content = textContent?.text?.value || '';
      if (content) {
        content = removeRAGCitations(content);
      }
    } else if (pusherMessage.role === 'system' && pusherMessage.message_type) {
      // System messages might not have traditional content
      content = `System: ${pusherMessage.message_type}`;
    }
    
    // Build metadata - ensure messageId is properly set for action_execution messages
    let metadata: Metadata = { message_type: 'text' };
    
    if (pusherMessage.message_type) {
      metadata.message_type = pusherMessage.message_type;
      
      // For action_execution messages, ensure messageId is set from data
      if (pusherMessage.message_type === 'action_execution' && pusherMessage.data) {
        metadata = {
          ...metadata,
          ...pusherMessage.data,
          messageId: pusherMessage.data.messageId || pusherMessage.data.id // Ensure messageId is set
        };
        
        console.log('🎯 [CHAT_STORE] Adding action_execution message via pusher:', {
          messageId: metadata.messageId,
          actionId: metadata.actionId,
          status: metadata.status,
          fullMetadata: metadata
        });
      } else if (pusherMessage.data) {
        metadata = { ...metadata, ...pusherMessage.data };
      }
    }
    
    const newMessage: ChatMessage = {
      id: pusherMessage.id || `pusher-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      content,
      role: pusherMessage.role || (pusherMessage.type === 'assistant' ? 'assistant' : 'user'),
      createdAt: pusherMessage.created_at || new Date(pusherMessage.timestamp).getTime() / 1000,
      metadata,
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

    // Clear the newSessionFromClear flag when user starts sending messages
    if (get().newSessionFromClear) {
      console.log('🔄 [CHAT_STORE] Clearing newSessionFromClear flag due to user message');
      set({ newSessionFromClear: null });
    }

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
        // Set clearing flag to prevent automatic message loading
        set({ isClearing: true, clearedSessionId: activeSessionId });
        console.log('🧹 [CHAT_STORE] Setting isClearing to true and tracking cleared session:', activeSessionId);

        const newSession = await clearAndRenewActiveSessionMST(); // Call the MST action
        
        emitter.emit(
          EVENT_CHAT_SESSION_DELETED,
          i18n.t('Notifications.sessionClearedAndNewStarted')
        );
        
        // Clear messages and invalidate cache for both old and new sessions
        if (activeSessionId) {
          messageCache.invalidate(activeSessionId);
        }
        if (newSession?._id && newSession._id !== activeSessionId) {
          messageCache.invalidate(newSession._id);
        }
        
        // Clear messages locally and track the new session
        set({ 
          messages: [], 
          newSessionFromClear: newSession?._id || null,
          isClearing: false 
        });
        console.log('🧹 [CHAT_STORE] Messages cleared locally, tracking new session from clear:', newSession?._id);

        if (newSession?.assistantId) {
           emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, newSession.assistantId);
        } else {
            emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantId);
        }

      } catch (error: any) {
        logger.error('Error in handleClearChat', error);
        // Reset clearing flag on error
        set({ isClearing: false });
      }
    }
  },

  updateActionExecutionMessage: (actionData) => {
    console.log('🏪 [CHAT_STORE] updateActionExecutionMessage called with:', actionData);
    console.log('📝 [CHAT_STORE] Action data details:', {
      timestamp: new Date().toISOString(),
      actionDataType: typeof actionData,
      actionDataKeys: actionData ? Object.keys(actionData) : [],
      messageId: actionData?.messageId || 'NOT_FOUND',
      actionId: actionData?.actionId || 'NOT_FOUND',
      status: actionData?.status || 'NOT_FOUND'
    });

    let messageFound = false;
    let messagesChecked = 0;
    let actionExecutionMessagesFound = 0;

    set((state) => {
      console.log('🔍 [CHAT_STORE] Searching through', state.messages.length, 'messages for action execution update');
      
      const updatedMessages = state.messages.map((msg, index) => {
        messagesChecked++;
        
        if (msg.metadata?.message_type === 'action_execution') {
          actionExecutionMessagesFound++;
          console.log(`📋 [CHAT_STORE] Found action_execution message #${actionExecutionMessagesFound} at index ${index}:`, {
            messageId: msg.id,
            metadataMessageId: msg.metadata?.messageId,
            targetMessageId: actionData.messageId,
            isMatch: msg.metadata?.messageId === actionData.messageId
          });
        }
        
        if (msg.metadata?.message_type === 'action_execution' && msg.metadata?.messageId === actionData.messageId) {
          messageFound = true;
          console.log('✅ [CHAT_STORE] Found matching action execution message, updating:', {
            messageIndex: index,
            messageId: msg.id,
            oldMetadata: msg.metadata,
            newActionData: actionData
          });
          
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
      });

      console.log('📊 [CHAT_STORE] Action execution update summary:', {
        messagesChecked,
        actionExecutionMessagesFound,
        messageFound,
        targetMessageId: actionData?.messageId
      });

      if (!messageFound) {
        console.warn('⚠️ [CHAT_STORE] No matching action execution message found for messageId:', actionData?.messageId);
        console.log('🔍 [CHAT_STORE] Available action execution messages:', 
          state.messages
            .filter(m => m.metadata?.message_type === 'action_execution')
            .map(m => ({ id: m.id, messageId: m.metadata?.messageId, content: m.content?.substring(0, 50) }))
        );
      }

      return { messages: updatedMessages };
    });
  },
}));

// Initialize audioRef event listener (this is a bit tricky with Zustand, might need to be in component)
// For now, assuming audioRef.current.onended is set in the component where audioRef is created.
