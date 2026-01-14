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
      icon={<UserIcon className="w-5 h-5 text-foreground" />}
      bgColor=""
      borderColor="bg-secondary"
      role="Human"
      dateText={formatRelativeTime(createdAt)}
    >
      <div className="whitespace-pre-wrap">{text}</div>
    </MessageWrapper>
  );
};

export { UserMessage };
