/// file_path: src/components/chat-container/ChatContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
  getSessionMessages,
  handleUserInput,
} from '../../services/api/assistantService';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_SET_ACTIVE_ASSISTANT,
} from '../../utils/eventNames';
import { emitter, useEventEmitter } from '../../services/mittEmitter';
import { IAssistant } from '../../store/models/Assistant';
import { SBChatKitUI } from '../sb-chat-kit-ui/SBChatKitUI';
import { textToSpeech } from '../../services/api/voiceService';

interface Metadata {
  message_type: string;
}

interface ChatMessage {
  content: string;
  role: string;
  metadata?: Metadata;
  assistantName?: string;
}

type AudioState = 'disabled' | 'enabled' | 'playing';


const ChatContainer = observer(() => {
  const rootStore = useRootStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistant, setAssistant] = useState<IAssistant | undefined>();
  const [audioState, setAudioState] = useState<AudioState>('disabled');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { activeSession } = rootStore.sessionStore;
  const assistantId = activeSession?.assistantId;
  

  useEffect(() => {
    if (assistantId && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  }, [assistantId, rootStore.assistantsLoaded]);

  const loadMessages = async () => {
    if (activeSession ) {
      const sessionMessages = await getSessionMessages(activeSession?._id || '');
      const chatMessages = sessionMessages.map(mapToChatMessage);
      setMessages(chatMessages.reverse());
    }
  };

  useEffect(() => {
    loadMessages();
  }, [assistant?._id]);

  const handleAssistantUpdated = async (assistantId: string) => {
    if (activeSession) {
      await rootStore.sessionStore.changeAssistant(assistantId);
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  };

  useEventEmitter<string>(EVENT_SET_ACTIVE_ASSISTANT, handleAssistantUpdated);


  const mapToChatMessage = (message: any): ChatMessage => ({
    content: message.content[0].text.value,
    role: message.role,
    metadata: message.metadata,
    assistantName: message.assistantName,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
    ]);

    if (assistant) {
      const response = await handleUserInput({
        userInput: message,
        sessionId: activeSession?._id || '',
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: response, role: 'assistant' },
      ]);

      if (audioState === 'enabled') {
        try {
          const audioUrl = await textToSpeech(response, 'shimmer');
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
    if (activeSession) {
      try {
        await rootStore.sessionStore.endActiveSession();
        emitter.emit(EVENT_CHAT_SESSION_DELETED, 'Chat session deleted');

        await rootStore.sessionStore.fetchActiveSession();
        setMessages([]);
      } catch (error) {
        console.error('Error in handleClear:', error);
        // Optionally, show an error message to the user
        // rootStore.uiStore.showErrorMessage('Failed to clear chat session. Please try again.');
      }
    }
  };



  return (
    <div className="h-full w-full bg-white rounded-lg">
      <SBChatKitUI
        messages={messages}
        assistant={
          assistant
            ? {
                name: assistant.name,
                description: assistant.description,
                avatar: '/assets/avatars/avatar-_0020_9.png',
              }
            : undefined
        }
        assistantName="AI Assistant"
        onSendMessage={handleSubmitMessage}
        onClear={handleClear}
        onToggleAudio={handleToggleAudio}
        audioState={audioState}
        language={'he'}
      />
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
});


export { ChatContainer };