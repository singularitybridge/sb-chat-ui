import React, { useState } from 'react';
import { SBChatKitUI } from '../components/sb-chat-kit-ui/SBChatKitUI';

const mockMessages = [
  { content: 'Hello, how can I help you?', role: 'assistant' },
  { content: 'I need assistance with my project.', role: 'user' },
  { content: 'Sure, what do you need help with?', role: 'assistant' },
];

const mockAssistant = {
  name: 'AI Assistant',
  description: 'I am here to help you with your project.',
};

const TestPage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = (message: any) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: 'user' },
      { content: 'This is a mock response.', role: 'assistant' },
    ]);
  };

  const handleReload = () => {
    setMessages([]);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          <SBChatKitUI
            messages={messages}
            assistant={mockAssistant}
            assistantName="AI Assistant" // Pass the assistant name here
            onSendMessage={handleSendMessage}
            onReload={handleReload}
            isMinimized={isMinimized}
            onToggleMinimize={handleToggleMinimize}
            isHebrew={false} // or true based on your preference
          />
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center h-96">
          Column 2
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
