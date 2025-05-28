import React, { useEffect, useState } from 'react';
import { SBChatKitUI } from '../../components/sb-chat-kit-ui/SBChatKitUI';

const mockMessages = [
  { id: Date.now().toString() + '-0', content: 'Hello, how can I help you?', role: 'assistant', createdAt: Date.now() },
  { id: Date.now().toString() + '-1', content: 'I need assistance with my project.', role: 'user', createdAt: Date.now() + 1000 },
  { id: Date.now().toString() + '-2', content: 'Sure, what do you need help with?', role: 'assistant', createdAt: Date.now() + 2000 },
];

const mockMessagesHebrew = [
  { id: Date.now().toString() + '-0', content: 'שלום, איך אני יכול לעזור לך?', role: 'assistant', createdAt: Date.now() },
  { id: Date.now().toString() + '-1', content: 'אני צריך עזרה עם הפרויקט שלי.', role: 'user', createdAt: Date.now() + 1000 },
  { id: Date.now().toString() + '-2', content: 'בטח, במה אתה צריך עזרה?', role: 'assistant', createdAt: Date.now() + 2000 },
];

const mockAssistant = {
  name: 'AI Assistant',
  description: 'I am here to help you with your project.',
  avatar: '/assets/avatars/avatar-_0013_16.png',
};

const mockAssistantHebrew = {
  name: 'סוכן AI',
  description: 'אני כאן כדי לעזור לך עם הפרויקט שלך.',
  avatar: '/assets/avatars/avatar-_0027_2.png',
};

const ChatKitTestPage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [messagesHebrew, setMessagesHebrew] = useState(mockMessagesHebrew);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'he' : 'en';
  }, [direction]);

  const toggleDirection = (newDirection: 'ltr' | 'rtl') => {
    setDirection(newDirection);
  };

  const handleSendMessage = (message: string) => {
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, content: message, role: 'user', createdAt: Date.now() },
      { id: assistantMessageId, content: 'This is a mock response.', role: 'assistant', createdAt: Date.now() + 1000 },
    ]);
  };

  const handleSendMessageHebrew = (message: string) => {
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();
    setMessagesHebrew((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, content: message, role: 'user', createdAt: Date.now() },
      { id: assistantMessageId, content: 'זו תגובה מדומה.', role: 'assistant', createdAt: Date.now() + 1000 },
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
        id: Date.now().toString(),
        content: 'This is a notification message.',
        role: 'system',
        metadata: { message_type: 'notification' },
        createdAt: Date.now(),
      },
    ]);
  };

  const handleAddActionMessage = () => {
    const addUserMessage = (message: string) => {
      const userMessageId = Date.now().toString();
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: userMessageId, content: message, role: 'user', createdAt: Date.now() },
        {
          id: assistantMessageId,
          content: `You selected ${message}. Here are some options.`,
          role: 'assistant',
          createdAt: Date.now() + 1000,
        },
      ]);
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        content: 'Very happy to hear that, what kind of car?',
        role: 'assistant',
        actions: [
          { label: 'Electric', onClick: () => addUserMessage('Electric') },
          { label: 'Gas', onClick: () => addUserMessage('Gas') },
        ],
        createdAt: Date.now(),
      },
    ]);
  };

  const [wideMessages, setWideMessages] = useState([
    { id: Date.now().toString() + '-0', content: 'Welcome to the wide mode chat!', role: 'assistant', createdAt: Date.now() },
    { id: Date.now().toString() + '-1', content: 'This is a test of the wide mode layout.', role: 'user', createdAt: Date.now() + 1000 },
    { id: Date.now().toString() + '-2', content: 'How does it look?', role: 'assistant', createdAt: Date.now() + 2000 },
  ]);

  const handleSendWideMessage = (message: string) => {
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();
    setWideMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, content: message, role: 'user', createdAt: Date.now() },
      { id: assistantMessageId, content: 'This is a mock response in wide mode.', role: 'assistant', createdAt: Date.now() + 1000 },
    ]);
  };

  const handleClearWide = () => {
    setWideMessages([]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border bg-indigo-300  border-gray-300 flex items-center justify-center h-[600px]">
          <div className="h-full w-full">
            <SBChatKitUI
              messages={messages}
              onToggleAudio={() => console.log('Toggled audio')}
              audioState='disabled'
              isLoading={false}
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
              onToggleAudio={() => console.log('Toggled audio')}
              isLoading={false}
              audioState='disabled'
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
            onToggleAudio={() => console.log('Toggled audio')}
            isLoading={false}
            audioState='disabled'
            assistant={{
              name: 'Wide Mode AI',
              description: 'This is a demo of the wide mode layout.',
              avatar: '/assets/avatars/avatar-_0006_23.png',
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

export { ChatKitTestPage };
