import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { MessageWrapper } from './MessageWrapper';

interface UserMessageProps {
  text: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ text }) => {
  return (
    <MessageWrapper icon={<UserIcon className="w-5 h-5 text-gray-800" />} bgColor="bg-gray-100" borderColor="bg-gray-100" role="Human">
      {text}
    </MessageWrapper>
  );
};

export { UserMessage };
