import React, { useEffect, useState } from 'react';
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
  avatar: 'assets/avatars/avatar-_0013_16.png',
};

const mockAssistantHebrew = {
  name: 'סוכן AI',
  description: 'אני כאן כדי לעזור לך עם הפרויקט שלך.',
  avatar: 'assets/avatars/avatar-_0027_2.png',
};

const TestPage = () => {

  const [messages, setMessages] = useState(mockMessages);
  const [messagesHebrew, setMessagesHebrew] = useState(mockMessagesHebrew);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // Update the dir attribute on the html element
    document.documentElement.dir = direction;
    // You might also want to update the lang attribute
    document.documentElement.lang = direction === 'rtl' ? 'he' : 'en';
  }, [direction]);

  const toggleDirection = (newDirection: 'ltr' | 'rtl') => {
    setDirection(newDirection);
  };


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

  const handleClear = () => {
    setMessages([]);
  };

  const handleClearHebrew = () => {
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
        {
          content: `You selected ${message}. Here are some options.`,
          role: 'assistant',
        },
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

  const [wideMessages, setWideMessages] = useState([
    { content: 'Welcome to the wide mode chat!', role: 'assistant' },
    { content: 'This is a test of the wide mode layout.', role: 'user' },
    { content: 'How does it look?', role: 'assistant' },
  ]);

  const handleSendWideMessage = (message: string) => {
    setWideMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
      { content: 'This is a mock response in wide mode.', role: 'assistant' },
    ]);
  };

  const handleClearWide = () => {
    setWideMessages([]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border bg-indigo-50  border-gray-300 flex items-center justify-center h-[600px]">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messages}
              assistant={mockAssistant}
              assistantName="AI Assistant"
              onSendMessage={handleSendMessage}
              onClear={handleClear}              
            />
          </div>
        </div>
        <div className="border border-gray-300 flex items-center justify-center h-[600px]">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messagesHebrew}
              assistant={mockAssistantHebrew}
              assistantName="סוכן AI"
              onSendMessage={handleSendMessageHebrew}
              onClear={handleClearHebrew}
            />
          </div>
        </div>
        <div className="border border-gray-300 flex flex-col items-center justify-center h-[600px]">
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
          <button
          onClick={() => toggleDirection('ltr')}
          className={`px-4 py-2 rounded ${
            direction === 'ltr' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          LTR
        </button>
        <button
          onClick={() => toggleDirection('rtl')}
          className={`px-4 py-2 rounded ${
            direction === 'rtl' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          RTL
        </button>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="border bg-white border-gray-300  h-[600px]">
          <SBChatKitUI
            messages={wideMessages}
            assistant={{
              name: 'Wide Mode AI',
              description: 'This is a demo of the wide mode layout.',
              avatar: 'assets/avatars/avatar-_0006_23.png',
            }}
            assistantName="Wide Mode AI"
            onSendMessage={handleSendWideMessage}
            onClear={handleClearWide}
          />
        </div>
      </div>
    </div>
  );
};

export { TestPage };
