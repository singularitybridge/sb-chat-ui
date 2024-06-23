import { UserIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageWrapper } from './MessageWrapper';

interface HumanAgentResponseMessageProps {
  text: string;
}

const HumanAgentResponseMessage: React.FC<HumanAgentResponseMessageProps> = ({ text }) => {
  return (
    <MessageWrapper icon={<UserIcon className="w-5 h-5 text-gray-700" />} bgColor="bg-yellow-100" borderColor="bg-yellow-300" role="Support Reviewer">
      <ReactMarkdown className="prose prose-sm">{text}</ReactMarkdown>
    </MessageWrapper>
  );
};

export { HumanAgentResponseMessage };
