import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import { Textarea } from './Textarea';
import { Loader, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { TextComponent } from './TextComponent';
import { AudioRecorder } from './AudioRecorder';

interface AIAssistedTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label: string;
  onAIAssist?: (aiPrompt: string) => Promise<void>;
  isLoading?: boolean;
  aiPrompt: string;
  onAIPromptChange: (value: string) => void;
}

const AIAssistedTextareaBase: ForwardRefRenderFunction<
  HTMLTextAreaElement,
  AIAssistedTextareaProps
> = (
  {
    id,
    value,
    onChange,
    placeholder,
    className,
    error,
    label,
    onAIAssist,
    isLoading = false,
    aiPrompt,
    onAIPromptChange,
  },
  ref
) => {
  const [isAIMode, setIsAIMode] = useState(false);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasToggledAIMode = useRef(false);

  const toggleAIMode = () => {
    hasToggledAIMode.current = true;
    setIsAIMode((prev) => !prev);
    if (isAIMode) {
      onAIPromptChange('');
    }
  };

  // Focus management only when AI mode is explicitly toggled by user
  useEffect(() => {
    if (!hasToggledAIMode.current) {
      return;
    }

    if (isAIMode) {
      aiTextareaRef.current?.focus();
    } else if (ref && 'current' in ref) {
      (ref as React.RefObject<HTMLTextAreaElement>).current?.focus();
    }
  }, [isAIMode, ref]);

  const handleAIAssist = async () => {
    if (onAIAssist) {
      await onAIAssist(aiPrompt);
    }
    setIsAIMode(false);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && isAIMode) {
        setIsAIMode(false);
        onAIPromptChange('');
      }
    },
    [isAIMode, onAIPromptChange]
  );

  const handleTranscriptionComplete = (transcription: string) => {
    onAIPromptChange(transcription);
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      <div className="mb-1">
        <TextComponent text={label} size="normal" color="normal" />
      </div>

      <div
        className={clsx(
          'grid border border-violet/30 rounded-xl p-0.5',
          isAIMode ? 'grid-cols-1' : 'grid-cols-[1fr,auto]',
          className
        )}
      >
        <Textarea
          ref={ref}
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
              className="m-2 p-1.5 text-violet hover:text-violet/80 rounded-md transition duration-150 ease-in-out"
              aria-label="Toggle AI Assist"
            >
              <Sparkles size={18} />
            </button>
          </div>
        )}
        {isAIMode && (
          <div className="grid bg-violet/10 rounded-b-xl grid-cols-[1fr,auto]">
            <Textarea
              ref={aiTextareaRef}
              id={`${id}-ai-prompt`}
              value={aiPrompt}
              onChange={(e) => onAIPromptChange(e)}
              placeholder="בקש מה-AI..."
              className="border-none"
              autogrow
              transparentBg={true}
            />
            <div className="flex items-end space-x-1 rtl:space-x-reverse m-2 justify-end rtl:justify-start">
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
              />
              <button
                onClick={handleAIAssist}
                disabled={isLoading}
                className="p-1.5 rounded-xl text-violet bg-violet/20 hover:bg-violet/30 transition duration-150 ease-in-out disabled:opacity-50"
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

export const AIAssistedTextarea = forwardRef<
  HTMLTextAreaElement,
  AIAssistedTextareaProps
>(AIAssistedTextareaBase);

AIAssistedTextarea.displayName = 'AIAssistedTextarea';
