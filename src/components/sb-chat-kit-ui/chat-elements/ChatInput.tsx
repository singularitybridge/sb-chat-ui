import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onReload: () => void;
  isHebrew?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onReload, isHebrew }) => {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmitMessage = (message: string) => {
    setMessage('');
    onSendMessage(message);
  };

  return (
    <div className="flex items-center flex-row-reverse pt-0 mt-1">
      <div
        className={`flex items-center justify-center ${
          isHebrew ? 'space-x-reverse' : ''
        } w-full space-x-2`}
      >
        <input
          className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
          placeholder={t('ChatContainer.input')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitMessage(message);
              e.preventDefault(); // Prevents the addition of a new line in the input after pressing 'Enter'
            }
          }}
        />
        <button
          onClick={() => handleSubmitMessage(message)}
          className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
        >
          <PaperAirplaneIcon
            className={`h-5 w-5 text-zinc-50 ${
              isHebrew ? '-scale-x-100' : ''
            }`}
          />{' '}
        </button>
        <button
          onClick={onReload}
          className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
        >
          <TrashIcon className="h-5 w-5 text-warning-200" />
        </button>
      </div>
    </div>
  );
};

export { ChatInput };
