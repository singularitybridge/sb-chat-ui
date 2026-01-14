/// file_path /src/pages/admin/inbox/InboxMessage.tsx
import React from 'react';
import {
  ChatBubbleLeftIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { IMessage } from '../../../types/entities';
import moment from 'moment';

interface InboxMessageProps {
  message: IMessage;
}

// Helper function to return the icon component with the styled div container
const getIconComponent = (message: IMessage) => {
  switch (message.type) {
    case 'human_agent_request':
      return (
        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 border border-border p-1">
          <ChatBubbleLeftIcon className="w-5 h-5 text-blue-700 dark:text-blue-300" />
        </div>
      );
    case 'human_agent_response':
      return (
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 border border-border p-1">
          <UserIcon className="w-5 h-5 text-green-700 dark:text-green-300" />
        </div>
      );
    case 'notification':
      return (
        <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-border p-1">
          <BellIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
        </div>
      );
    default:
      return (
        <div className="rounded-full bg-secondary border border-border p-1">
          <ChatBubbleLeftIcon className="w-5 h-5 text-foreground" />
        </div>
      );
  }
};

const InboxMessage: React.FC<InboxMessageProps> = ({ message }) => {
  const iconComponent = getIconComponent(message);

  return (
    <div className="flex gap-3 my-4 text-muted-foreground text-sm" key={message._id}>
      <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        {iconComponent}
      </span>
      <div>
        <p className="font-bold text-foreground">
          {message.type === 'human_agent_response'
            ? 'Support Reviewer'
            : message.assistantName || 'AI Assistant'}
        </p>
        <p className="leading-relaxed">{message.message}</p>
        <p className="text-xs text-muted-foreground">
          {moment(message.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
};

export { InboxMessage };
