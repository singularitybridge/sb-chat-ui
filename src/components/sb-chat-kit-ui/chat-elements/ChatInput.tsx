import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isHebrew?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isHebrew,
}) => {
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
    <div className="flex items-end pt-0 mt-1 w-full ">
      <div
        className={`flex flex-row   bg-neutral-200 items-end ${
          isHebrew ? 'space-x-reverse' : ''
        } w-full space-x-2 rounded-3xl px-3 py-2`}
      >
        <textarea
          ref={textareaRef}
          className="flex-grow min-h-6 bg-neutral-200 resize-none overflow-hidden border-none focus:ring-0 text-sm   text-gray-800 placeholder-gray-500 focus:outline-none"
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
        <div className="flex flex-col justify-end">
          <button
            onClick={() => handleSubmitMessage(message)}
            className="inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 h-7 w-7 pt-1.5"
          >
            <PaperAirplaneIcon
              className={`h-5 w-5  text-gray-600 ${
                isHebrew ? '-scale-x-100' : ''
              }`}
            />{' '}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChatInput };
