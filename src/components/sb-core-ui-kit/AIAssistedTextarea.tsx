import React, { useState, useEffect } from 'react';
import { Textarea } from './Textarea';  // Import your existing Textarea component
import { Mic, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface AIAssistedTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const AIAssistedTextarea: React.FC<AIAssistedTextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  error,
}) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(document.dir === 'rtl' || document.documentElement.lang === 'he');
  }, []);

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
    if (isAIMode) {
      setAIPrompt('');
    }
  };

  const handleAIPromptChange = (newPrompt: string) => {
    setAIPrompt(newPrompt);
  };

  const handleAIAssist = () => {
    console.log('AI Assist requested with prompt:', aiPrompt);
    onChange(value);
    setIsAIMode(false);
    setAIPrompt('');
  };

  return (
    <div className={clsx(
      'grid border border-indigo-200 rounded-xl p-0.5',
      isAIMode ? 'grid-cols-1' : 'grid-cols-[auto,1fr]',
      isRTL && !isAIMode && 'grid-cols-[1fr,auto]',
      className
    )}>
      {!isAIMode && (
        <div className={clsx('flex items-end ', isRTL ? 'order-last' : 'order-first')}>
          <button
            onClick={toggleAIMode}
            className="m-1 p-1.5 text-indigo-400 hover:text-indigo-500 rounded-md transition duration-150 ease-in-out"
            aria-label="Toggle AI Assist"
          >
            <Sparkles size={18} />
          </button>
        </div>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='border-none'
        error={error}
        autogrow
      />
      {isAIMode && (
        <div className={clsx(
          'grid bg-indigo-50 bg-opacity-70 rounded-b-xl',
          isRTL ? 'grid-cols-[1fr,auto]' : 'grid-cols-[auto,1fr]'
        )}>
          <div className={clsx('flex items-end space-x-1 m-2 rtl:space-x-reverse', isRTL ? 'order-last' : 'order-first')}>
            <button
              onClick={handleAIAssist}
              className="p-1.5 rounded-xl text-gray-500  bg-pink-100 hover:bg-pink-200 transition duration-150 ease-in-out"
              aria-label="Apply AI Assist"
            >
              <Mic size={18} />
            </button>
            <button
              onClick={handleAIAssist}
              className="p-1.5 rounded-xl text-gray-500  bg-indigo-100 hover:bg-indigo-200 transition duration-150 ease-in-out"
              aria-label="Apply AI Assist"
            >
              <Sparkles size={18} />
            </button>
          </div>
          <Textarea
            id={`${id}-ai-prompt`}
            value={aiPrompt}
            onChange={handleAIPromptChange}
            placeholder="בקש מה-AI..."
            className="border-none"
            autogrow
            transparentBg={true}
          />
        </div>
      )}
    </div>
  );
};

export { AIAssistedTextarea };