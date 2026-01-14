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
  maxHeight?: number;
}

// Function to check if text contains Hebrew letters
const containsHebrew = (text: string): boolean => {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

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
  maxHeight = 300,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setDirection(containsHebrew(newValue) ? 'rtl' : 'ltr');
  };

  useEffect(() => {
    if (autogrow && textareaRef && 'current' in textareaRef && textareaRef.current) {
      const textarea = textareaRef.current;
      
      textarea.style.height = 'auto';
      
      let newHeight = textarea.scrollHeight;
      
      if (maxHeight && newHeight > maxHeight) {
        newHeight = maxHeight;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autogrow, textareaRef, maxHeight]);

  return (
    <div className="flex flex-col w-full">
      <div
        className={clsx(
          'flex py-3 px-5 justify-end items-center gap-2 self-stretch rounded-lg transition-all duration-200',
          {
            'bg-background': !transparentBg,
            'bg-transparent': transparentBg,
            'border border-ring': isFocused && !error,
            'border border-destructive': error,
            'border border-input': !isFocused && !error,
            'opacity-50': disabled,
          },
          className
        )}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={autogrow ? 1 : rows}
          className={clsx(
            'w-full text-base font-normal leading-[140%] tracking-[0.56px] focus:outline-hidden bg-transparent',
            {
              'resize-none': autogrow,
              'resize-vertical': !autogrow,
              'text-foreground': value && !disabled,
              'text-muted-foreground placeholder:text-muted-foreground': !value || disabled,
            }
          )}
          id={id}
          dir={direction}
        />
      </div>
      {error && (
        <p className="p-1 mt-1 text-sm text-destructive rtl:text-right ltr:text-left">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };