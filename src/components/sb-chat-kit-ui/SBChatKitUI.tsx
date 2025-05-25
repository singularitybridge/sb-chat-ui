import React, { useEffect, useRef, useState } from 'react';
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
import { dotWave } from 'ldrs';
import { ActionExecutionMessage } from './chat-elements/ActionExecutionMessage';
import { isImageFile } from '../../utils/fileUtils';

interface Metadata {
  message_type: string;
  [key: string]: any;
}

interface Action {
  label: string;
  onClick: () => void;
}

interface ChatMessage {
  id: string; // Added to match ChatContainer's ChatMessage
  content: string;
  role: string;
  metadata?: Metadata;
  actions?: Action[];
  createdAt: number;
  fileMetadata?: import('../../types/chat').FileMetadata;
}

type AudioState = 'disabled' | 'enabled' | 'playing';

interface SBChatKitUIProps {
  messages: ChatMessage[];
  assistant?: {
    name: string;
    description: string;
    avatar: string;
    conversationStarters?: Array<{ key: string; value: string }>;
  };
  assistantName: string;
  onSendMessage: (message: string, fileMetadata?: import('../../types/chat').FileMetadata) => void;
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
  const [chatStarted, setChatStarted] = useState(false);

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

    // If there are messages, set chatStarted to true
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

  const handleSendMessage = (message: string, fileMetadata?: import('../../types/chat').FileMetadata) => {
    if (!chatStarted) {
      setChatStarted(true);
    }
    onSendMessage(message, fileMetadata);
  };

  return (
    <div
      style={{
        ...style,
      }}
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
            onToggleAudio={onToggleAudio}
            audioState={audioState}
          />

          <div className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300">
            {messages.map((message, index) => { // index is still used for disabledMessages logic
              const key = message.id; // Use message.id for React key

              if (message.role === 'system') {
                switch (message.metadata?.message_type) {
                  case 'action_execution':
                    return (
                      <ActionExecutionMessage
                        key={key}
                        // Pass all relevant fields from metadata (which is the API's 'data' object + message_type)
                        messageId={message.id} // Changed from message.metadata.messageId to message.id
                        status={message.metadata.status as 'started' | 'completed' | 'failed'}
                        actionId={message.metadata.actionId}
                        serviceName={message.metadata.serviceName}
                        actionTitle={message.metadata.actionTitle}
                        actionDescription={message.metadata.actionDescription}
                        icon={message.metadata.icon}
                        originalActionId={message.metadata.originalActionId}
                        // Any other fields from message.metadata that ActionExecutionMessage might need
                      />
                    );
                  case 'integration_action_update':
                    // Placeholder rendering for integration_action_update
                    // TODO: Create a specific component e.g., <IntegrationUpdateMessage key={key} data={message.metadata} />
                    return (
                      <NotificationMessage
                        key={key}
                        text={`Integration Update: ${message.content} (Details: ${JSON.stringify(message.metadata)})`}
                      />
                    );
                  case 'notification': // Existing explicit handler
                    return (
                      <NotificationMessage key={key} text={message.content} />
                    );
                  default:
                    // Fallback for other system message types: display the basic text content
                    // This uses message.content which should be "System: <message_type>" as per guide
                    // TODO: Create a specific <SystemTextMessage key={key} text={message.content} /> if distinct styling is needed
                    return (
                      <NotificationMessage key={key} text={message.content} />
                    );
                }
              } else if (message.role === 'user') {
                // Check if this is a file message
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
                // Standard user text message
                return (
                  <UserMessage
                    key={key}
                    text={message.content}
                    createdAt={message.createdAt}
                  />
                );
              } else if (message.role === 'assistant') {
                // Check for assistant messages that might be special types, e.g. with actions
                // Note: The guide implies action_execution is role: system. If it can be assistant, this logic might need adjustment.
                if (message.actions && message.actions.length > 0) {
                  return (
                    <ActionMessage
                      key={key}
                      text={message.content}
                      actions={message.actions}
                      role={assistantName} // Display name for the sender of the action message
                      isDisabled={disabledMessages.includes(index)} // disabledMessages uses array index
                    />
                  );
                }
                // Standard assistant text message
                return (
                  <AssistantMessage
                    key={key}
                    text={message.content}
                    assistantName={assistantName}
                    createdAt={message.createdAt}
                  />
                );
              } else if (message.metadata?.message_type === 'human-agent-response') {
                // This type might have a role like 'agent' or 'assistant'.
                // Keeping its original position in logic for now.
                return (
                  <HumanAgentResponseMessage
                    key={key}
                    text={message.content}
                  />
                );
              } else {
                // Fallback for any message structure not explicitly handled.
                // This could be a simple text display or a warning.
                console.warn('SBChatKitUI: Unhandled message structure', message);
                // Optionally render a generic message or null
                return (
                  <NotificationMessage key={key} text={`Unknown message: ${message.content}`} />
                );
              }
            })}
            {isLoading && (
              <div className="flex justify-center items-center my-4">
                <l-dot-wave size="40" speed="1" color="black"></l-dot-wave>
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
