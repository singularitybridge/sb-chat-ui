import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface UserMessageProps {
  text: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ text }) => {
  return (
    <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
      <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div className="rounded-full bg-gray-100 border p-1">
          <UserIcon className="w-5 h-5 text-gray-800" />
        </div>
      </span>
      {text}
    </div>
  );
};

export { UserMessage };
