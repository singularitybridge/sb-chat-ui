import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { MessageWrapper } from './MessageWrapper';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface UserMessageProps {
  text: string;
  createdAt: number;
}

const UserMessage: React.FC<UserMessageProps> = ({ text, createdAt }) => {
  return (
    <MessageWrapper 
      icon={<UserIcon className="w-5 h-5 text-gray-800" />} 
      bgColor="" 
      borderColor="bg-gray-100" 
      role="Human"
      dateText={formatRelativeTime(createdAt)}
    >
      {text}
    </MessageWrapper>
  );
};

export { UserMessage };
