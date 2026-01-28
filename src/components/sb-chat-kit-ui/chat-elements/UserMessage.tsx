import React from 'react';
import { User } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/dateUtils';
import { useAuthStore } from '../../../store/useAuthStore';

interface UserMessageProps {
  text: string;
  createdAt: number;
}

// Extract first name from full name
const getFirstName = (fullName: string): string => {
  if (!fullName) return 'You';
  const firstName = fullName.split(' ')[0];
  return firstName || 'You';
};

const UserMessage: React.FC<UserMessageProps> = ({ text, createdAt }) => {
  const userName = useAuthStore(state => state.userSessionInfo.userName);
  const firstName = getFirstName(userName);

  return (
    <div className="flex w-full max-w-[95%] flex-col gap-1 ml-auto justify-end my-2">
      {/* Header - right aligned */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[13px] font-medium text-foreground">{firstName}</span>
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {/* Message bubble - right aligned */}
      <div className="mr-9 ml-auto w-fit max-w-full">
        <div className="bg-secondary rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-foreground">
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
        {/* Timestamp at bottom */}
        <span className="text-[10px] text-muted-foreground mt-1 block text-right">{formatRelativeTime(createdAt)}</span>
      </div>
    </div>
  );
};

export { UserMessage };
