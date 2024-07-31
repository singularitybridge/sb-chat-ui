/// file_path: src/components/sb-chat-kit-ui/chat-elements/AssistantMessage.tsx
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import { MessageWrapper } from './MessageWrapper';

interface AssistantMessageProps {
  text: string;
  assistantName: string; // Remove optional since it's now required
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName }) => {
  return (
    <MessageWrapper icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-blue-100" role={assistantName}>
      <ReactMarkdown className="prose prose-sm">{text}</ReactMarkdown>
    </MessageWrapper>
  );
};

export { AssistantMessage };
