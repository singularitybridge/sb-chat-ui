import React, { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import {
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import {
  getSessionById,
  updateSessionAssistant,
} from '../../services/api/sessionService';

interface ChatMessage {
  content: string;
  role: string;
}

const ChatContainer = observer(() => {

  const rootStore = useRootStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistant, setAssistant] = useState<IAssistant>();

  const userId = rootStore.sessionStore.activeSession?.userId;
  const assistantId = rootStore.sessionStore.activeSession?.assistantId;
  const companyId = rootStore.sessionStore.activeSession?.companyId;

  useEffect(() => {
    if (assistantId && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantId));
    }
  }, [assistantId, rootStore.sessionStore.activeSession]);

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

    console.log('set assistantId', assistantId);
    await updateSessionAssistant(rootStore.sessionStore.activeSession?._id || '', assistantId);    
    const session = await getSessionById(rootStore.sessionStore.activeSession?._id || '');
    rootStore.sessionStore.setActiveSession(session);
    setAssistant(rootStore.getAssistantById(assistantId));
  };

  useEventEmitter<string>(EVENT_SET_ACTIVE_ASSISTANT, handleAssistantUpdated);

  const mapToChatMessage = (message: any): ChatMessage => {
    return {
      content: message.content[0].text.value,
      role: message.role,
    };
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = (message: string) => {
    setMessage('');
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
        className="fixed mr-3 mb-3 bottom-4 right-4 w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center"
        onClick={handleMinimize}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          boxShadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
          zIndex: 5000,
        }}
        className="fixed bottom-[calc(2rem)] right-0 mr-7 bg-white p-5 rounded-lg border border-[#e5e7eb] w-[340px] h-[534px] flex flex-col"
      >
        <Header
          title={assistant?.name || ''}
          description={assistant?.description || ''}
          onMinimize={handleMinimize}
        />
        <div
          className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300"
          style={{
            minWidth: '100%',
          }}
        >
          {messages.map((message, index) =>
            message.role === 'assistant' ? (
              <AssistantMessage key={index} text={message.content} />
            ) : (
              <UserMessage key={index} text={message.content} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center pt-0 mt-1">
          <div className="flex items-center justify-center w-full space-x-2">
            <input
              className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitMessage(message);
                  e.preventDefault(); // Prevents the addition of a new line in the input after pressing 'Enter'
                }
              }}
            />
            <button
              onClick={() => handleSubmitMessage(message)}
              className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
            >
              <PaperAirplaneIcon className="h-5 w-5 text-zinc-50 " />
            </button>
            <button
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
            >
              <TrashIcon className="h-5 w-5 text-warning-200" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export { ChatContainer };
