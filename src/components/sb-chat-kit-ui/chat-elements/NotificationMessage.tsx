import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { MessageWrapper } from './MessageWrapper';

interface NotificationMessageProps {
  text: string;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({ text }) => {
  return (
    <MessageWrapper icon={<BellIcon className="w-5 h-5 text-gray-700" />} bgColor="bg-blue-100" borderColor="bg-blue-300" role="Notification">
      <span className="block font-bold text-gray-800">Notification</span>
      {text}
    </MessageWrapper>
  );
};

export { NotificationMessage };
