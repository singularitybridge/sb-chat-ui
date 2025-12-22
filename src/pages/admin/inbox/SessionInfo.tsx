/// file_path /src/pages/admin/inbox/SessionInfo.tsx
import React from 'react';
import { IInboxSession } from '../../../types/entities';
import moment from 'moment';

export interface SessionInfoProps {
  session: IInboxSession;
  isActive: boolean;
  onClick: () => void;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  session,
  isActive,
  onClick,
}) => {
  const activeClass = isActive ? 'bg-sky-100' : '';

  return (
    <li
      key={session.sessionId}
      className={`py-3 px-3 transition hover:bg-indigo-100 cursor-pointer ${activeClass}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">
          {session.userName}
        </h3>
        <p className="text-xs text-gray-500">
          {moment(session.lastMessageAt).fromNow()}
        </p>
      </div>
      <div className="text-sm text-gray-500">
        {session.messages.length > 0
          ? session.messages[session.messages.length - 1].message
          : 'No messages'}
      </div>
    </li>
  );
};