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

interface ChatMessage {
  content: string;
  role: string;
  metadata?: Metadata;
  assistantName?: string;
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
      const sessionMessages = await getSessionMessages(
        activeSession?._id || ''
      );
      const chatMessages = sessionMessages.map(mapToChatMessage);
      setMessages(chatMessages.reverse());
    }
  };

  useEffect(() => {
    loadMessages();
    
    if (activeSession?._id) {
      const handleChatMessage = (message: PusherChatMessage) => {
        const newMessage = {
          content: message.content,
          role: message.type === 'assistant' ? 'assistant' : 'user',
          createdAt: new Date(message.timestamp).getTime() / 1000
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(message.type === 'user');
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

  const mapToChatMessage = (message: any): ChatMessage => ({
    content: removeRAGCitations(message.content[0].text.value),
    role: message.role,
    metadata: message.metadata,
    assistantName: message.assistantName,
    createdAt: message.created_at,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user', createdAt: Date.now() / 1000 },
    ]);
    setIsLoading(true);

    if (assistant) {
      try {
        const response = await handleUserInput({
          userInput: message,
          sessionId: activeSession?._id || '',
        });
        const cleanedResponse = removeRAGCitations(response);
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: cleanedResponse, role: 'assistant', createdAt: Date.now() / 1000 },
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

  const handleActionExecution = (data: ActionExecutionMessage) => {
    setMessages((prevMessages) => {
      const index = prevMessages.findIndex(
        (msg) => msg.metadata?.message_type === 'action_execution' && msg.metadata.messageId === data.messageId
      );

      if (index !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = {
          ...updatedMessages[index],
          metadata: {
            ...updatedMessages[index].metadata,
            ...data,
            message_type: 'action_execution',
          },
        };
        return updatedMessages;
      } else {
        return [
          ...prevMessages,
          {
            content: '',
            role: 'assistant',
            createdAt: Date.now() / 1000,
            metadata: {
              message_type: 'action_execution',
              ...data,
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
