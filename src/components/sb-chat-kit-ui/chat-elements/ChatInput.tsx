import React, { useState, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitMessage = (message: string) => {
    setMessage('');
    onSendMessage(message);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="flex items-end pt-0 mt-1 w-full">
      <div className={`flex items-end ${isHebrew ? 'space-x-reverse' : ''} w-full space-x-2 border border-[#e5e7eb] rounded-3xl p-3`}>
        <textarea
          ref={textareaRef}
          className="flex-grow resize-none overflow-hidden border-none focus:ring-0 text-sm placeholder-[#6b7280] focus:outline-none"
          placeholder={t('ChatContainer.input')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmitMessage(message);
              e.preventDefault(); // Prevents the addition of a new line in the input after pressing 'Enter'
            }
          }}
          rows={1} // Start with one row
        />
        <div className="flex flex-col justify-end space-y-1">
          <button
            onClick={() => handleSubmitMessage(message)}
            className="inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 h-7 w-7 pt-1.5"
          >
            <PaperAirplaneIcon
              className={`h-5 w-5  text-gray-600 ${isHebrew ? '-scale-x-100' : ''}`}
            />{' '}
          </button>
          <button
            onClick={onReload}
            className="inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 h-7  w-7"
          >
            <TrashIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChatInput };
