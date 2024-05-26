import React, { useState } from 'react';
import { SBChatKitUI } from '../components/sb-chat-kit-ui/SBChatKitUI';

const mockMessages = [
  { content: 'Hello, how can I help you?', role: 'assistant' },
  { content: 'I need assistance with my project.', role: 'user' },
  { content: 'Sure, what do you need help with?', role: 'assistant' },
];

const mockMessagesHebrew = [
  { content: 'שלום, איך אני יכול לעזור לך?', role: 'assistant' },
  { content: 'אני צריך עזרה עם הפרויקט שלי.', role: 'user' },
  { content: 'בטח, במה אתה צריך עזרה?', role: 'assistant' },
];

const mockAssistant = {
  name: 'AI Assistant',
  description: 'I am here to help you with your project.',
  avatar: 'images/avatars/av4.png',
};

const mockAssistantHebrew = {
  name: 'עוזר AI',
  description: 'אני כאן כדי לעזור לך עם הפרויקט שלך.',
  avatar: 'images/avatars/av4.png',
};

const TestPage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [messagesHebrew, setMessagesHebrew] = useState(mockMessagesHebrew);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMinimizedHebrew, setIsMinimizedHebrew] = useState(false);

  const handleSendMessage = (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
      { content: 'This is a mock response.', role: 'assistant' },
    ]);
  };

  const handleSendMessageHebrew = (message: string) => {
    setMessagesHebrew((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
      { content: 'זו תגובה מדומה.', role: 'assistant' },
    ]);
  };

  const handleReload = () => {
    setMessages([]);
  };

  const handleReloadHebrew = () => {
    setMessagesHebrew([]);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleToggleMinimizeHebrew = () => {
    setIsMinimizedHebrew(!isMinimizedHebrew);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messages}
              assistant={mockAssistant}
              assistantName="AI Assistant"
              onSendMessage={handleSendMessage}
              onReload={handleReload}
              isMinimized={isMinimized}
              onToggleMinimize={handleToggleMinimize}
              isHebrew={false}
            />
          </div>
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messagesHebrew}
              assistant={mockAssistantHebrew}
              assistantName="עוזר AI"
              onSendMessage={handleSendMessageHebrew}
              onReload={handleReloadHebrew}
              isMinimized={isMinimizedHebrew}
              onToggleMinimize={handleToggleMinimizeHebrew}
              isHebrew={true}
            />
          </div>
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          Column 3
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          Column 4
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          Column 5
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          Column 6
        </div>
      </div>
    </div>
  );
};

export { TestPage };
