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
    <div className="not-prose bg-card p-8 rounded-lg border border-border text-center mb-6">
      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
        <Inbox className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{message}</p>
      <p className="text-xs text-muted-foreground/70">{description}</p>
    </div>
  );
};
