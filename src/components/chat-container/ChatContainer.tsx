/// file_path: src/components/chat-container/ChatContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
  endSession,
  getSessionMessages,
  handleUserInput,
} from '../../services/api/assistantService';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_SET_ACTIVE_ASSISTANT,
} from '../../utils/eventNames';
import { emitter, useEventEmitter } from '../../services/mittEmitter';
import { IAssistant } from '../../store/models/Assistant';
import {
  createSession,
  getSessionById,
  updateSessionAssistant,
} from '../../services/api/sessionService';
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

const ChatContainer = observer(() => {
  const rootStore = useRootStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistant, setAssistant] = useState<IAssistant | undefined>();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);



  const { activeSession } = rootStore.sessionStore;
  const userId = activeSession?.userId;
  const assistantId = activeSession?.assistantId;
  const companyId = activeSession?.companyId;

  useEffect(() => {
    if (assistantId && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  }, [assistantId, rootStore.assistantsLoaded]);

  const loadMessages = async () => {
    if (assistant && userId && companyId) {
      const sessionMessages = await getSessionMessages(companyId, userId);
      const chatMessages = sessionMessages.map(mapToChatMessage);
      setMessages(chatMessages.reverse());
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userId, assistant?._id]);

  const handleAssistantUpdated = async (assistantId: string) => {
    if (activeSession) {
      await updateSessionAssistant(activeSession._id, assistantId);
      const updatedSession = await getSessionById(activeSession._id);
      rootStore.sessionStore.setActiveSession(updatedSession);
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

    if (assistant && userId && companyId) {
      const response = await handleUserInput({
        userInput: message,
        companyId,
        userId,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: response, role: 'assistant' },
      ]);

      if (isAudioEnabled) {
        try {
          const audioUrl = await textToSpeech(response, 'shimmer');
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            console.log('Playing audio response:', audioUrl);
            audioRef.current.play();
          }
        } catch (error) {
          console.error('Failed to play audio response:', error);
        }
      }
    }
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

    
  const handleClear = async () => {
    if (activeSession) {
      const { companyId, userId } = activeSession;
      try {
        await endSession(companyId, userId);
        rootStore.sessionStore.clearActiveSession();
        emitter.emit(EVENT_CHAT_SESSION_DELETED, 'Chat session deleted');

        const newSession = await createSession(userId, companyId, assistant?._id);
        rootStore.sessionStore.setActiveSession(newSession);
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
        isAudioEnabled={isAudioEnabled}
      />
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
});


export { ChatContainer };