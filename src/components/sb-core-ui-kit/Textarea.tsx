// file_path: src/components/sb-core-ui-kit/Textarea.tsx
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import clsx from 'clsx';

interface TextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  error?: string;
  autogrow?: boolean;
  transparentBg?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  placeholder,
  rows = 3,
  disabled,
  className,
  error,
  autogrow = false,
  transparentBg = false,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const innerRef = useRef<HTMLTextAreaElement>(null);

  const textareaRef = ref || innerRef;

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  useEffect(() => {
    if (autogrow && textareaRef && 'current' in textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autogrow, textareaRef]);

  return (
    <div className="flex flex-col w-full">
      <div
        className={clsx(
          'flex py-3 px-5 justify-end items-center gap-2 self-stretch rounded-lg transition-all duration-200',
          {
            'bg-white': !transparentBg,
            'bg-transparent': transparentBg,
            'border border-gray-400': isFocused && !error,
            'border border-red-500': error,
            'border border-gray-300': !isFocused && !error,
            'opacity-50': disabled,
          },
          className
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={autogrow ? 1 : rows}
          className={clsx(
            'w-full rtl:text-right ltr:text-left text-base font-normal leading-[140%] tracking-[0.56px] focus:outline-none bg-transparent',
            {
              'resize-none': autogrow,
              'resize-vertical': !autogrow,
              'text-gray-800': value && !disabled,
              'text-gray-400 placeholder-gray-400': !value || disabled,
            }
          )}
          id={id}
        />
      </div>
      {error && (
        <p className="p-1 mt-1 text-sm text-red-500 rtl:text-right ltr:text-left">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };