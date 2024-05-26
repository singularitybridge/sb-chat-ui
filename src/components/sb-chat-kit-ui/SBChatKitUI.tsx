import React, { useEffect, useRef, useState } from 'react';
import { Header } from './chat-elements/Header';
import { AssistantMessage } from './chat-elements/AssistantMessage';
import { UserMessage } from './chat-elements/UserMessage';
import {
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { HumanAgentResponseMessage } from './chat-elements/HumanAgentResponseMessage';

interface Metadata {
  message_type: string;
}

interface ChatMessage {
  content: string;
  role: string;
  metadata?: Metadata;
}

interface SBChatKitUIProps {
  messages: ChatMessage[];
  assistant?: {
    name: string;
    description: string;
  };
  assistantName: string; // Add assistantName as a prop
  onSendMessage: (message: string) => void;
  onReload: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isHebrew?: boolean;
}

const SBChatKitUI: React.FC<SBChatKitUIProps> = ({
  messages,
  assistant,
  assistantName,
  onSendMessage,
  onReload,
  isMinimized = false,
  onToggleMinimize,
  className = '',
  style = {},
  isHebrew = false,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = (message: string) => {
    setMessage('');
    onSendMessage(message);
  };

  if (isMinimized) {
    return (
      <button
        className={`fixed mb-3 bottom-4 ${
          isHebrew ? 'left-4 ml-3' : 'right-4 mr-3'
        } w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center`}
        onClick={onToggleMinimize}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div
      style={{
        boxShadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        zIndex: 5000,
        ...style,
      }}
      className={`bg-white p-5 rounded-lg border border-[#e5e7eb] flex flex-col ${className}`}
    >
      <Header
        title={assistant?.name || ''}
        description={assistant?.description || ''}
        onMinimize={onToggleMinimize}
      />
      <div
        className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300"
      >
        {messages.map((message, index) => {
          if (message.metadata?.message_type === 'human-agent-response') {
            return (
              <HumanAgentResponseMessage key={index} text={message.content} />
            );
          } else if (message.role === 'assistant') {
            return (
              <AssistantMessage
                key={index}
                text={message.content}
                assistantName={assistantName} // Pass assistantName prop
              />
            );
          } else {
            return <UserMessage key={index} text={message.content} />;
          }
        })}

        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center flex-row-reverse pt-0 mt-1">
        <div
          className={`flex items-center justify-center ${
            isHebrew ? 'space-x-reverse' : ''
          } w-full space-x-2`}
        >
          <input
            className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
            placeholder={t('ChatContainer.input')}
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
            <PaperAirplaneIcon
              className={`h-5 w-5 text-zinc-50 ${
                isHebrew ? '-scale-x-100' : ''
              }`}
            />{' '}
          </button>
          <button
            onClick={onReload}
            className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
          >
            <TrashIcon className="h-5 w-5 text-warning-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { SBChatKitUI };
