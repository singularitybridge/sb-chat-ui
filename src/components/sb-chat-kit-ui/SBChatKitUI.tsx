/// file_path: src/components/sb-chat-kit-ui/SBChatKitUI.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Header } from './chat-elements/Header';
import { AssistantMessage } from './chat-elements/AssistantMessage';
import { UserMessage } from './chat-elements/UserMessage';
import { HumanAgentResponseMessage } from './chat-elements/HumanAgentResponseMessage';
import { NotificationMessage } from './chat-elements/NotificationMessage';
import { ActionMessage } from './chat-elements/ActionMessage';
import { ChatInput } from './chat-elements/ChatInput';
import { DefaultChatView } from './chat-elements/DefaultChatView';
import { dotWave, leapfrog } from 'ldrs';

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

type AudioState = 'disabled' | 'enabled' | 'playing';

interface SBChatKitUIProps {
  messages: ChatMessage[];
  assistant?: {
    name: string;
    description: string;
    avatar: string;
  };
  assistantName: string;
  onSendMessage: (message: string) => void;
  onClear: () => void;
  className?: string;
  style?: React.CSSProperties;
  onToggleAudio: () => void;
  audioState: AudioState;
  isLoading: boolean;
}

const SBChatKitUI: React.FC<SBChatKitUIProps> = ({
  messages,
  assistant,
  assistantName,
  onSendMessage,
  onClear,
  onToggleAudio,
  audioState,
  className = '',
  style = {},  
  isLoading,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [disabledMessages, setDisabledMessages] = useState<number[]>([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Disable all previous action messages when a new message is added
    if (messages.length > 1) {
      const newMessageIndex = messages.length - 1;
      const previousMessageIndices = messages
        .slice(0, newMessageIndex)
        .map((message, index) => (message.actions ? index : -1))
        .filter((index) => index !== -1);

      setDisabledMessages(previousMessageIndices);
    }
  }, [messages]);

  useEffect(() => {
    dotWave.register();
  }, []);

  return (
    <div
      style={{
        ...style,
      }}
      className={`p-4 flex flex-col ${className} h-full w-full`}
    >
      {messages.length === 0 && assistant ? (
        <DefaultChatView assistant={assistant} />
      ) : (
        <>
          <Header
            title={assistant?.name || ''}
            description={assistant?.description || ''}
            avatar={assistant?.avatar || ''}
            onClear={onClear}
            onToggleAudio={onToggleAudio}
            audioState={audioState}
          />

          <div className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300">
            {messages.map((message, index) => {
              if (message.metadata?.message_type === 'human-agent-response') {
                return (
                  <HumanAgentResponseMessage
                    key={index}
                    text={message.content}
                  />
                );
              } else if (message.metadata?.message_type === 'notification') {
                return (
                  <NotificationMessage key={index} text={message.content} />
                );
              } else if (message.actions && message.actions.length > 0) {
                return (
                  <ActionMessage
                    key={index}
                    text={message.content}
                    actions={message.actions}
                    role={assistantName}
                    isDisabled={disabledMessages.includes(index)}
                  />
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
            {isLoading && (
              <div className="flex justify-center items-center my-4">
                <l-dot-wave size="40" speed="1" color="black"></l-dot-wave>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </>
      )}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export { SBChatKitUI };
