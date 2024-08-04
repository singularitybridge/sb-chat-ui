/// file_path /src/pages/admin/inbox/InboxMessage.tsx
import React from 'react';
import {
  ChatBubbleLeftIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { IMessage } from '../../../store/models/Inbox';
import moment from 'moment';

interface InboxMessageProps {
  message: IMessage;
}

// Helper function to return the icon component with the styled div container
const getIconComponent = (message: IMessage) => {
  switch (message.type) {
    case 'human_agent_request':
      return (
        <div className="rounded-full bg-blue-100 border p-1">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-800" />
        </div>
      );
    case 'human_agent_response':
      return (
        <div className="rounded-full bg-green-100 border p-1">
          <UserIcon className="w-5 h-5 text-gray-800" />
        </div>
      );
    case 'notification':
      return (
        <div className="rounded-full bg-yellow-100 border p-1">
          <BellIcon className="w-5 h-5 text-gray-800" />
        </div>
      );
    default:
      return (
        <div className="rounded-full bg-gray-100 border p-1">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-800" />
        </div>
      );
  }
};

const InboxMessage: React.FC<InboxMessageProps> = ({ message }) => {
  const iconComponent = getIconComponent(message);

  return (
    <div className="flex gap-3 my-4 text-gray-600 text-sm" key={message._id}>
      <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        {iconComponent}
      </span>
      <div>
        <p className="font-bold text-gray-800">
          {message.type === 'human_agent_response'
            ? 'Support Reviewer'
            : message.assistantName || 'AI Assistant'}
        </p>
        <p className="leading-relaxed">{message.message}</p>
        <p className="text-xs text-gray-500">
          {moment(message.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
};

export { InboxMessage };
