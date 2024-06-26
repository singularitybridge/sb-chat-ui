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
  getSessionById,
  updateSessionAssistant,
} from '../../services/api/sessionService';
import { SBChatKitUI } from '../sb-chat-kit-ui/SBChatKitUI';
import { PlusIcon } from '@heroicons/react/24/outline';

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
  // const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistant, setAssistant] = useState<IAssistant>();

  const userId = rootStore.sessionStore.activeSession?.userId;
  const assistantId = rootStore.sessionStore.activeSession?.assistantId;
  const companyId = rootStore.sessionStore.activeSession?.companyId;
  const isHebrew = rootStore.language === 'he';

  useEffect(() => {
    if (assistantId && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  }, [assistantId, rootStore.assistantsLoaded]);

  const loadMessages = async () => {
    if (assistant && userId) {
      const sessionMessages = await getSessionMessages(companyId || '', userId);
      const chatMessages = sessionMessages.map(mapToChatMessage);
      setMessages(chatMessages.reverse());
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userId, assistant?._id]);

  const handleAssistantUpdated = async (assistantId: string) => {
    await updateSessionAssistant(
      rootStore.sessionStore.activeSession?._id || '',
      assistantId
    );
    const session = await getSessionById(
      rootStore.sessionStore.activeSession?._id || ''
    );
    rootStore.sessionStore.setActiveSession(session);
    setAssistant(rootStore.getAssistantById(assistantId));
  };

  useEventEmitter<string>(EVENT_SET_ACTIVE_ASSISTANT, handleAssistantUpdated);

  const mapToChatMessage = (message: any): ChatMessage => {
    return {
      content: message.content[0].text.value,
      role: message.role,
      metadata: message.metadata,
      assistantName: message.assistantName,
    };
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = (message: string) => {
    // setMessage('');
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
    ]);

    if (assistant && userId && companyId) {
      handleUserInput({
        userInput: message,
        companyId: companyId,
        userId: userId,
      }).then((response) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: response, role: 'assistant' },
        ]);
      });
    }
  };

  const handleReload = async () => {
    if (assistant && userId && companyId) {
      await endSession(companyId, userId);
      rootStore.sessionStore.clearActiveSession();
      emitter.emit(EVENT_CHAT_SESSION_DELETED, 'Chat session deleted');
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <button
        className={`fixed mb-3 bottom-4 ${
          isHebrew ? 'left-4 ml-3' : 'right-4 mr-3'
        } w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center`}
        onClick={handleMinimize}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div>
      <SBChatKitUI
        messages={messages}
        assistant={
          assistant
            ? {
                name: assistant.name,
                description: assistant.description,
                avatar: '/images/avatars/av4.png',
              }
            : undefined
        }
        assistantName="AI Assistant"
        onSendMessage={handleSubmitMessage}
        onReload={handleReload}
        isMinimized={isMinimized}
        onToggleMinimize={handleMinimize}
        isHebrew={isHebrew}
      />
    </div>
  );
});

export { ChatContainer };
