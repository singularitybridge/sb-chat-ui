import React from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { IMessage } from '../../../store/models/Inbox';
import moment from 'moment';

interface InboxMessageProps {
  message: IMessage;
}

const InboxMessage: React.FC<InboxMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-3 my-4 text-gray-600 text-sm" key={message._id}>
      <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div className="rounded-full bg-gray-100 border p-1">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-800" />
        </div>
      </span>
      <div>
        <p className="font-bold text-gray-800">
          {message.assistantName || 'Anonymous'}
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
