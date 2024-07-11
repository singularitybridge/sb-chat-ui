import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { AudioRecorder } from '../../sb-core-ui-kit/AudioRecorder';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  language?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  language = 'en',
}) => {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitMessage = (message: string) => {
    setMessage('');
    onSendMessage(message);
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setMessage(transcription);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="flex items-end w-full">
      <div className="flex flex-row bg-neutral-100 items-end rtl:space-x-reverse w-full space-x-2 rounded-2xl px-3 py-2">
        <textarea
          ref={textareaRef}
          className="flex-grow px-2 min-h-6 bg-neutral-100 resize-none overflow-hidden border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
          placeholder={t('ChatContainer.input')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmitMessage(message);
              e.preventDefault();
            }
          }}
          rows={1}
        />
        <div className="flex flex-col justify-end space-x-2 rtl:space-x-reverse">
          <div>
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            language={language}
          />
          <button
            onClick={() => handleSubmitMessage(message)}
            className="inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 h-7 w-7"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-gray-600 rtl:-scale-x-100" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChatInput };
