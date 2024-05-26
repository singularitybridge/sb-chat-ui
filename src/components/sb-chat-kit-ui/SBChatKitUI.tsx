import React, { useEffect, useRef } from 'react';
import { Header } from './chat-elements/Header';
import { AssistantMessage } from './chat-elements/AssistantMessage';
import { UserMessage } from './chat-elements/UserMessage';
import { HumanAgentResponseMessage } from './chat-elements/HumanAgentResponseMessage';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ChatInput } from './chat-elements/ChatInput';

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
    avatar: string; // Add avatar to assistant object
  };
  assistantName: string;
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        ...style,
      }}
      className={`bg-white p-5 rounded-lg border border-[#e5e7eb] flex flex-col ${className} h-full w-full`}
    >
      <Header
        title={assistant?.name || ''}
        description={assistant?.description || ''}
        avatar={assistant?.avatar || ''} // Pass avatar prop
        onMinimize={onToggleMinimize}
      />
      <div className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300">
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
                assistantName={assistantName}
              />
            );
          } else {
            return <UserMessage key={index} text={message.content} />;
          }
        })}

        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={onSendMessage}
        onReload={onReload}
        isHebrew={isHebrew}
      />
    </div>
  );
};

export { SBChatKitUI };
