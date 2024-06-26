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
  name: 'סוכן AI',
  description: 'אני כאן כדי לעזור לך עם הפרויקט שלך.',
  avatar: 'images/avatars/av4.png',
};

const TestPage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [messagesHebrew, setMessagesHebrew] = useState(mockMessagesHebrew);

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

  const handleAddNotification = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: 'This is a notification message.',
        role: 'system',
        metadata: { message_type: 'notification' },
      },
    ]);
  };

  const handleAddActionMessage = () => {
    const addUserMessage = (message: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message, role: 'user' },
        { content: `You selected ${message}. Here are some options.`, role: 'assistant' },
      ]);
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: 'Very happy to hear that, what kind of car?',
        role: 'assistant',
        actions: [
          { label: 'Electric', onClick: () => addUserMessage('Electric') },
          { label: 'Gas', onClick: () => addUserMessage('Gas') },
        ],
      },
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border bg-gray-100 border-gray-300 p-4 flex items-center justify-center h-[600px]">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messages}
              assistant={mockAssistant}
              assistantName="AI Assistant"
              onSendMessage={handleSendMessage}
              onReload={handleReload}
              isHebrew={false}
            />
          </div>
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-[600px]">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messagesHebrew}
              assistant={mockAssistantHebrew}
              assistantName="סוכן AI"
              onSendMessage={handleSendMessageHebrew}
              onReload={handleReloadHebrew}
              isHebrew={true}
            />
          </div>
        </div>
        <div className="border border-gray-300 p-4 flex flex-col items-center justify-center h-[600px]">
          <button
            onClick={handleAddNotification}
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
          >
            Send Notification
          </button>
          <button
            onClick={handleAddActionMessage}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Send Action Message
          </button>
        </div>
      </div>
    </div>
  );
};

export { TestPage };
