import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { MessageWrapper } from './MessageWrapper';

interface NotificationMessageProps {
  text: string;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({ text }) => {
  return (
    <MessageWrapper icon={<BellIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-gray-300" role="Notification">
      {text}
    </MessageWrapper>
  );
};

export { NotificationMessage };
