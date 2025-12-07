import React from 'react';
import { Inbox } from 'lucide-react';

interface SessionsEmptyProps {
  message?: string;
  description?: string;
}

/**
 * Empty state component for active sessions
 * Matches the HTML empty state design
 */
export const SessionsEmpty: React.FC<SessionsEmptyProps> = ({
  message = 'No active sessions',
  description = 'Start a voice call to see session information here',
}) => {
  return (
    <div className="not-prose bg-white p-8 rounded-lg border border-gray-200 text-center mb-6">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Inbox className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-1">{message}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};
