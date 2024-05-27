import React, { useEffect, useRef } from 'react';
import { Header } from './chat-elements/Header';
import { AssistantMessage } from './chat-elements/AssistantMessage';
import { UserMessage } from './chat-elements/UserMessage';
import { HumanAgentResponseMessage } from './chat-elements/HumanAgentResponseMessage';
import { NotificationMessage } from './chat-elements/NotificationMessage';
import { ActionMessage } from './chat-elements/ActionMessage'; // Import the new component
import { ChatInput } from './chat-elements/ChatInput';

interface Metadata {
  message_type: string;
}

interface Action {
  label: string;
  onClick: () => void;
}

interface ChatMessage {
  content: string;
  role: string;
  metadata?: Metadata;
  actions?: Action[];
}

interface SBChatKitUIProps {
  messages: ChatMessage[];
  assistant?: {
    name: string;
    description: string;
    avatar: string;
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
  onToggleMinimize,
  className = '',
  style = {},
  isHebrew = false,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [disabledMessages, setDisabledMessages] = React.useState<number[]>([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setDisabledMessages((prev) => [...prev, messages.length - 1]);
  }, [messages]);

  return (
    <div
      style={{
        boxShadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        direction: isHebrew ? 'rtl' : 'ltr',
        ...style,
      }}
      className={`bg-white p-5 rounded-lg border border-[#e5e7eb] flex flex-col ${className} h-full w-full`}
    >
      <Header
        title={assistant?.name || ''}
        description={assistant?.description || ''}
        avatar={assistant?.avatar || ''}
        onMinimize={onToggleMinimize}
      />
      <div className={`flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300 ${isHebrew ? 'text-right' : ''}`}>
        {messages.map((message, index) => {
          if (message.metadata?.message_type === 'human-agent-response') {
            return <HumanAgentResponseMessage key={index} text={message.content} />;
          } else if (message.metadata?.message_type === 'notification') {
            return <NotificationMessage key={index} text={message.content} />;
          } else if (message.actions && message.actions.length > 0) {
            return (
              <ActionMessage
                key={index}
                text={message.content}
                actions={message.actions}
                role={assistantName}
              />
            );
          } else if (message.role === 'assistant') {
            return <AssistantMessage key={index} text={message.content} assistantName={assistantName} />;
          } else {
            return <UserMessage key={index} text={message.content} />;
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} onReload={onReload} isHebrew={isHebrew} />
    </div>
  );
};

export { SBChatKitUI };

