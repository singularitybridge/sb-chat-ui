import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Header } from './chat-elements/Header';
import { AssistantMessage } from './chat-elements/AssistantMessage';
import { UserMessage } from './chat-elements/UserMessage';
import { HumanAgentResponseMessage } from './chat-elements/HumanAgentResponseMessage';
import { NotificationMessage } from './chat-elements/NotificationMessage';
import { ActionMessage } from './chat-elements/ActionMessage';
import { ChatInput } from './chat-elements/ChatInput';
import { DefaultChatView } from './chat-elements/DefaultChatView';
import { ImageMessage } from './chat-elements/ImageMessage';
import { PdfMessage } from './chat-elements/PdfMessage';
import { FileMessage } from './chat-elements/FileMessage';
import { CsvMessage } from './chat-elements/CsvMessage';
import { dotWave } from 'ldrs';
import { ToolCallsGroup, ToolCall } from './chat-elements/ToolCallsGroup';
import { isImageFile } from '../../utils/fileUtils';
import { Base64Attachment } from '../../utils/base64Utils';
import { useEventEmitter } from '@/services/mittEmitter';

interface Metadata {
  message_type: string;
  [key: string]: any;
}

interface Action {
  label: string;
  onClick: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  role: string;
  metadata?: Metadata;
  actions?: Action[];
  createdAt: number;
  fileMetadata?: import('../../types/chat').FileMetadata;
}

interface SBChatKitUIProps {
  messages: ChatMessage[];
  assistant?: {
    name: string;
    description: string;
    avatar: string;
    conversationStarters?: Array<{ key: string; value: string }>;
  };
  assistantName: string;
  onSendMessage: (message: string, attachments?: Base64Attachment[]) => void;
  onClear: () => void;
  className?: string;
  style?: React.CSSProperties;
  isLoading: boolean;
  compact?: boolean;
}

// Group consecutive action_execution messages
interface MessageGroup {
  type: 'single' | 'tool-calls';
  messages: ChatMessage[];
  startIndex: number;
}

const SBChatKitUI: React.FC<SBChatKitUIProps> = ({
  messages,
  assistant,
  assistantName,
  onSendMessage,
  onClear,
  className = '',
  style = {},
  isLoading,
  compact = false,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [disabledMessages, setDisabledMessages] = useState<number[]>([]);
  const [chatStarted, setChatStarted] = useState(false);

  // Group consecutive action_execution messages
  const messageGroups = useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentToolCalls: ChatMessage[] = [];
    let toolCallStartIndex = -1;

    messages.forEach((message, index) => {
      const isToolCall = message.role === 'system' && message.metadata?.message_type === 'action_execution';

      if (isToolCall) {
        if (currentToolCalls.length === 0) {
          toolCallStartIndex = index;
        }
        currentToolCalls.push(message);
      } else {
        // Flush tool calls group if we have any
        if (currentToolCalls.length > 0) {
          groups.push({
            type: 'tool-calls',
            messages: [...currentToolCalls],
            startIndex: toolCallStartIndex
          });
          currentToolCalls = [];
          toolCallStartIndex = -1;
        }
        // Add single message
        groups.push({
          type: 'single',
          messages: [message],
          startIndex: index
        });
      }
    });

    // Flush remaining tool calls
    if (currentToolCalls.length > 0) {
      groups.push({
        type: 'tool-calls',
        messages: [...currentToolCalls],
        startIndex: toolCallStartIndex
      });
    }

    return groups;
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    if (messages.length > 1) {
      const newMessageIndex = messages.length - 1;
      const previousMessageIndices = messages
        .slice(0, newMessageIndex)
        .map((message, index) => (message.actions ? index : -1))
        .filter((index) => index !== -1);

      setDisabledMessages(previousMessageIndices);
    }

    if (messages.length > 0) {
      setChatStarted(true);
    }
  }, [messages]);

  useEffect(() => {
    dotWave.register();
  }, []);

  const handleStartChat = () => {
    setChatStarted(true);
  };

  const handleClearChat = () => {
    onClear();
    setChatStarted(false);
  };

  const handleSendMessage = useCallback((message: string, attachments?: Base64Attachment[]) => {
    if (!chatStarted) {
      setChatStarted(true);
    }
    onSendMessage(message, attachments);
  }, [chatStarted, onSendMessage]);

  useEventEmitter<string>('chat:send-message', handleSendMessage);

  const renderMessage = (message: ChatMessage, index: number) => {
    const key = message.id;

    if (message.role === 'system') {
      switch (message.metadata?.message_type) {
        case 'integration_action_update':
          return (
            <NotificationMessage
              key={key}
              text={`Integration Update: ${message.content}`}
            />
          );
        case 'notification':
          return (
            <NotificationMessage key={key} text={message.content} />
          );
        default:
          return (
            <NotificationMessage key={key} text={message.content} />
          );
      }
    } else if (message.role === 'user') {
      if (message.fileMetadata) {
        if (isImageFile(message.fileMetadata.mimeType)) {
          return (
            <ImageMessage
              key={key}
              fileMetadata={message.fileMetadata}
              content={message.content}
              role={message.role}
              createdAt={message.createdAt}
            />
          );
        } else if (message.fileMetadata.mimeType === 'application/pdf') {
          return (
            <PdfMessage
              key={key}
              fileMetadata={message.fileMetadata}
              content={message.content}
              role={message.role}
              createdAt={message.createdAt}
            />
          );
        } else if (message.fileMetadata.mimeType === 'text/csv') {
          return (
            <CsvMessage
              key={key}
              fileMetadata={message.fileMetadata}
              content={message.content}
              role={message.role}
              createdAt={message.createdAt}
            />
          );
        } else {
          return (
            <FileMessage
              key={key}
              fileMetadata={message.fileMetadata}
              content={message.content}
              role={message.role}
              createdAt={message.createdAt}
            />
          );
        }
      }
      return (
        <UserMessage
          key={key}
          text={message.content}
          createdAt={message.createdAt}
        />
      );
    } else if (message.role === 'assistant') {
      // Skip empty assistant messages (shown during loading)
      if (!message.content || message.content.trim() === '') {
        return null;
      }
      if (message.actions && message.actions.length > 0) {
        return (
          <ActionMessage
            key={key}
            text={message.content}
            actions={message.actions}
            role={assistantName}
            isDisabled={disabledMessages.includes(index)}
          />
        );
      }
      return (
        <AssistantMessage
          key={key}
          text={message.content}
          assistantName={assistantName}
          createdAt={message.createdAt}
          metadata={message.metadata}
        />
      );
    } else if (message.metadata?.message_type === 'human-agent-response') {
      return (
        <HumanAgentResponseMessage
          key={key}
          text={message.content}
        />
      );
    } else {
      console.warn('SBChatKitUI: Unhandled message structure', message);
      return (
        <NotificationMessage key={key} text={`Unknown message: ${message.content}`} />
      );
    }
  };

  return (
    <div
      style={{ ...style }}
      className={`p-2 flex flex-col ${className} h-full w-full space-y-2`}
    >
      {!chatStarted && assistant ? (
        <DefaultChatView
          assistant={assistant}
          onSendMessage={handleSendMessage}
          onStartChat={handleStartChat}
        />
      ) : (
        <>
          <Header
            title={assistant?.name || ''}
            description={assistant?.description || ''}
            avatar={assistant?.avatar || ''}
            onClear={handleClearChat}
            compact={compact}
          />

          <div className="grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300">
            {messageGroups.map((group, groupIndex) => {
              if (group.type === 'tool-calls') {
                // Render grouped tool calls
                const toolCalls: ToolCall[] = group.messages.map(msg => ({
                  id: msg.id,
                  messageId: msg.id,
                  status: msg.metadata?.status as 'started' | 'completed' | 'failed',
                  actionId: msg.metadata?.actionId || '',
                  serviceName: msg.metadata?.serviceName || '',
                  actionTitle: msg.metadata?.actionTitle || '',
                  actionDescription: msg.metadata?.actionDescription || '',
                  icon: msg.metadata?.icon || '',
                  originalActionId: msg.metadata?.originalActionId || '',
                }));

                return (
                  <ToolCallsGroup
                    key={`tool-group-${groupIndex}`}
                    toolCalls={toolCalls}
                    maxVisible={3}
                  />
                );
              } else {
                // Render single message
                const message = group.messages[0];
                return renderMessage(message, group.startIndex);
              }
            })}
            {isLoading && (
              <div className="flex w-full max-w-[95%] flex-col gap-1 my-2">
                {/* Thinking indicator styled like AssistantMessage */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary">
                      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-foreground">{assistantName}</span>
                </div>
                <div className="ml-9">
                  <div className="bg-primary/5 rounded-2xl rounded-tl-sm px-4 py-3 w-fit">
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <span>Thinking</span>
                      <l-dot-wave size="20" speed="1" color="currentColor"></l-dot-wave>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </>
      )}
    </div>
  );
};

export { SBChatKitUI };
