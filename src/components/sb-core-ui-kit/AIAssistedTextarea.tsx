import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Textarea } from './Textarea';
import { Loader, Mic, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { TextComponent } from './TextComponent';

interface AIAssistedTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label: string;

  onAIAssist?: (aiPrompt: string) => Promise<void>;
  onRecording?: () => void;

  isLoading?: boolean;
  isRecording?: boolean;
}

const AIAssistedTextarea: React.FC<AIAssistedTextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  error,
  label,

  onAIAssist,
  onRecording,

  isLoading = false,
  isRecording = false,
}) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleAIMode = () => {
    setIsAIMode((prev) => !prev);
    if (isAIMode) {
      setAIPrompt('');
    }
  };

  useEffect(() => {
    if (isAIMode) {
      aiTextareaRef.current?.focus();
    } else {
      mainTextareaRef.current?.focus();
    }
  }, [isAIMode]);

  const handleAIPromptChange = (newPrompt: string) => {
    setAIPrompt(newPrompt);
  };

  const handleRecording = () => {
    if (onRecording) {
      onRecording();
    }
  };

  const handleAIAssist = async () => {
    if (onAIAssist) {
      await onAIAssist(aiPrompt);
    }
    setIsAIMode(false);
    setAIPrompt('');
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAIMode) {
        setIsAIMode(false);
        setAIPrompt('');
      }
    },
    [isAIMode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="div">
      <div className="mb-1">
        <TextComponent text={label} size="normal" color="normal" />
      </div>

      <div
        className={clsx(
          'grid border border-indigo-200 rounded-xl p-0.5',
          isAIMode ? 'grid-cols-1' : 'grid-cols-[1fr,auto]',
          className
        )}
      >
        <Textarea
          ref={mainTextareaRef}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={clsx('border-none', isAIMode && 'opacity-50')}
          error={error}
          autogrow
        />
        {!isAIMode && (
          <div className="flex items-end justify-end rtl:justify-start">
            <button
              onClick={toggleAIMode}
              className="m-2 p-1.5 text-indigo-400 hover:text-indigo-500 rounded-md transition duration-150 ease-in-out"
              aria-label="Toggle AI Assist"
            >
              <Sparkles size={18} />
            </button>
          </div>
        )}
        {isAIMode && (
          <div className="grid bg-indigo-50 bg-opacity-70 rounded-b-xl grid-cols-[1fr,auto]">
            <Textarea
              ref={aiTextareaRef}
              id={`${id}-ai-prompt`}
              value={aiPrompt}
              onChange={handleAIPromptChange}
              placeholder="בקש מה-AI..."
              className="border-none"
              autogrow
              transparentBg={true}
            />
            <div className="flex items-end space-x-1 rtl:space-x-reverse m-2 justify-end rtl:justify-start">
              <button
                onClick={handleRecording}
                className="p-1.5 rounded-xl text-gray-500 bg-pink-100 hover:bg-pink-200 transition duration-150 ease-in-out"
                aria-label="Apply AI Assist"
              >
                {isRecording ? (
                  <Mic size={18} className="animate-pulse text-red-500" />
                ) : (
                  <Mic size={18} />
                )}
              </button>
              <button
                onClick={handleAIAssist}
                disabled={isLoading}
                className="p-1.5 rounded-xl text-gray-500 bg-indigo-100 hover:bg-indigo-200 transition duration-150 ease-in-out disabled:opacity-50"
                aria-label="Apply AI Assist"
              >
                {isLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AIAssistedTextarea };
