import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
  getSessionMessages,
  handleUserInput,
} from '../../services/api/assistantService';
import { addEventHandler, removeEventHandler } from '../../services/PusherService';
import { ChatMessage as PusherChatMessage } from '../../types/pusher';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_ACTION_EXECUTION,
  EVENT_ADD_IFRAME_MESSAGE,
} from '../../utils/eventNames';
import { emitter, useEventEmitter } from '../../services/mittEmitter';
import { IAssistant } from '../../store/models/Assistant';
import { SBChatKitUI } from '../sb-chat-kit-ui/SBChatKitUI';
import { textToSpeech, TTSVoice } from '../../services/api/voiceService';
import i18n from '../../i18n';
import { changeSessionLanguage } from '../../services/api/sessionService';

interface Metadata {
  message_type: string;
  [key: string]: any;
}

// Interface for the message structure from the /session/:sessionId/messages API
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
  data?: { [key: string]: any }; // Represents the 'data' object from API
}

// Updated ChatMessage interface for UI consumption
interface ChatMessage {
  id: string; // Unique message identifier
  content: string;
  role: string;
  metadata?: Metadata; // Will store message_type and contents of ApiResponseMessage.data
  assistantName?: string; // Optional, if needed for specific display
  createdAt: number;
}

interface ActionExecutionMessage {
  messageId: string;
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
  status: 'started' | 'completed' | 'failed';
}

const removeRAGCitations = (text: string): string => {
  return text.replace(/【\d+:\d+†source】/g, '');
};

type AudioState = 'disabled' | 'enabled' | 'playing';

const getDefaultConversationStarters = () => [
  {
    key: i18n.t('ChatContainer.defaultStarters.startChat.key'),
    value: i18n.t('ChatContainer.defaultStarters.startChat.value')
  },
  {
    key: i18n.t('ChatContainer.defaultStarters.askQuestion.key'),
    value: i18n.t('ChatContainer.defaultStarters.askQuestion.value')
  }
];

const ChatContainer = observer(() => {
  const rootStore = useRootStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistant, setAssistant] = useState<IAssistant | undefined>();
  const [audioState, setAudioState] = useState<AudioState>('disabled');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { activeSession } = rootStore.sessionStore;
  const assistantId = activeSession?.assistantId;

  useEffect(() => {
    if (assistantId && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  }, [assistantId, rootStore.assistantsLoaded]);

  useEffect(() => {
    const setSessionLanguage = async () => {
      if (activeSession) {
        await changeSessionLanguage(activeSession._id, rootStore.language);
      }
    };
    setSessionLanguage();
  }, [activeSession, rootStore.language]);

  const loadMessages = async () => {
    if (activeSession) {
      const sessionApiMessages: ApiResponseMessage[] = await getSessionMessages(
        activeSession?._id || ''
      );
      const chatMessages = sessionApiMessages.map(mapToChatMessage);
      setMessages(chatMessages.reverse());
    }
  };

  useEffect(() => {
    loadMessages();
    
    if (activeSession?._id) {
      const handleChatMessage = (pusherMessage: PusherChatMessage) => {
        const newMessage: ChatMessage = {
          // PusherChatMessage (ChatMessage from pusher.ts) does not have an 'id' property.
          // Always generate a unique ID for messages originating from Pusher.
          id: `pusher-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          content: removeRAGCitations(pusherMessage.content),
          role: pusherMessage.type === 'assistant' ? 'assistant' : 'user',
          createdAt: new Date(pusherMessage.timestamp).getTime() / 1000,
          metadata: {
            message_type: 'text', 
          },
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(pusherMessage.type === 'user');
      };

      addEventHandler('chat_message', handleChatMessage);
      
      return () => {
        removeEventHandler('chat_message', handleChatMessage);
      };
    }
  }, [assistant?._id, activeSession?._id]);

  const handleAssistantUpdated = async (assistantId: string) => {
    await rootStore.sessionStore.changeAssistant(assistantId);
  };

  useEventEmitter<string>(EVENT_SET_ACTIVE_ASSISTANT, handleAssistantUpdated);

  const mapToChatMessage = (apiMessage: ApiResponseMessage): ChatMessage => {
    const textValue = apiMessage.content?.[0]?.text?.value || 
                      (apiMessage.role === 'system' ? `System: ${apiMessage.message_type}` : 'No content available');
    
    const mappedMetadata: Metadata = {
      message_type: apiMessage.message_type,
      ...(apiMessage.data || {})
    };

    // If the message is an action_execution from the API,
    // its 'data' object contains an 'id' field for the action execution.
    // The ActionExecutionMessage component expects this as 'messageId' in its props (via metadata).
    if (apiMessage.message_type === 'action_execution' && apiMessage.data?.id) {
      mappedMetadata.messageId = apiMessage.data.id;
    }
  
    return {
      id: apiMessage.id, // This is the chat message's own ID (e.g., "msg_...")
      content: removeRAGCitations(textValue),
      role: apiMessage.role,
      metadata: mappedMetadata,
      createdAt: apiMessage.created_at,
    };
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async (message: string) => {
    const userMessageId = `local-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: userMessageId,
        content: message,
        role: 'user',
        createdAt: Date.now() / 1000,
        metadata: { message_type: 'text' },
      },
    ]);
    setIsLoading(true);

    if (assistant) {
      try {
        const responseText = await handleUserInput({
          userInput: message,
          sessionId: activeSession?._id || '',
        });
        const cleanedResponse = removeRAGCitations(responseText);
        const assistantMessageId = `local-assistant-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: assistantMessageId,
            content: cleanedResponse,
            role: 'assistant',
            createdAt: Date.now() / 1000,
            metadata: { message_type: 'text' },
          },
        ]);

        if (audioState === 'enabled') {
          try {
            const audioUrl = await textToSpeech(cleanedResponse, assistant.voice as TTSVoice)
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              console.log('Playing audio response:', audioUrl);
              audioRef.current.play();
              setAudioState('playing');
            }
          } catch (error) {
            console.error('Failed to play audio response:', error);
          }
        }
      } catch (error) {
        console.error('Error getting assistant response:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = () => {
    if (audioState === 'disabled') {
      setAudioState('enabled');
    } else if (audioState === 'enabled') {
      setAudioState('disabled');
    } else if (audioState === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setAudioState('enabled');
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setAudioState('enabled');
      };
    }
  }, []);

  const handleClear = async () => {
    if (activeSession && assistant) {
      try {
        await rootStore.sessionStore.endActiveSession();
        emitter.emit(
          EVENT_CHAT_SESSION_DELETED,
          i18n.t('Notifications.sessionCleared')
        );

        await rootStore.sessionStore.fetchActiveSession();
        setMessages([]);

        emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistant._id);
      } catch (error) {
        console.error('Error in handleClear:', error);
      }
    }
  };

  const handleActionExecution = (actionData: ActionExecutionMessage) => {
    setMessages((prevMessages) => {
      const index = prevMessages.findIndex(
        (msg) => msg.metadata?.message_type === 'action_execution' && msg.metadata?.messageId === actionData.messageId
      );

      if (index !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = {
          ...updatedMessages[index],
          metadata: { // Ensure metadata is not undefined
            ...(updatedMessages[index].metadata || { message_type: 'action_execution' }), // Keep existing or init
            ...actionData, // Spread the new action data (this is ActionExecutionMessage from Pusher)
            message_type: 'action_execution', // Explicitly set/confirm message_type
          },
        };
        return updatedMessages;
      } else {
        // If adding a new message for an action execution
        const newActionMessageId = `action-${actionData.messageId}-${Date.now()}`;
        return [
          ...prevMessages,
          {
            id: newActionMessageId, // Ensure new messages also have an ID
            content: `System: Action ${actionData.actionTitle} ${actionData.status}`, // Placeholder content
            role: 'system', // System messages for actions
            createdAt: Date.now() / 1000,
            metadata: {
              message_type: 'action_execution',
              ...actionData, // actionData is the ActionExecutionMessage payload
            },
          },
        ];
      }
    });
  };

  useEventEmitter(EVENT_ACTION_EXECUTION, handleActionExecution);

  // Updated event listener for iframe messages
  useEventEmitter<string>(EVENT_ADD_IFRAME_MESSAGE, (message) => {
    handleSubmitMessage(message);
  });

  return (
    <div className="h-full w-full bg-zinc-50 rounded-2xl pr-2 rtl:pl-2 rtl:pr-0">
      <SBChatKitUI
        messages={messages}
        assistant={
          assistant
            ? {
                name: assistant.name,
                description: assistant.description,
                avatar: assistant.avatarImage,
                conversationStarters: assistant.conversationStarters?.length 
                  ? assistant.conversationStarters 
                  : getDefaultConversationStarters(),
              }
            : undefined
        }
        assistantName="AI Assistant"
        onSendMessage={handleSubmitMessage}
        onClear={handleClear}
        onToggleAudio={handleToggleAudio}
        audioState={audioState}
        isLoading={isLoading}
      />
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
});

export { ChatContainer };
