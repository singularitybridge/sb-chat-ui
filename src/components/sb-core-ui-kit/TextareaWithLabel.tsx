import React, { useRef, useEffect, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface TextareaWithLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  autogrow?: boolean;
  maxHeight?: number;
  className?: string;
}

// Function to check if text contains Hebrew letters
const containsHebrew = (text: string): boolean => {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

const TextareaWithLabel: React.FC<TextareaWithLabelProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  error,
  disabled,
  rows = 3,
  placeholder,
  autogrow = false,
  maxHeight = 300,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setDirection(containsHebrew(newValue) ? 'rtl' : 'ltr');
  };

  // Autogrow effect
  useEffect(() => {
    if (autogrow && textareaRef.current) {
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
  }, [value, autogrow, maxHeight]);

  // Set initial direction based on value
  useEffect(() => {
    if (value) {
      setDirection(containsHebrew(value) ? 'rtl' : 'ltr');
    }
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value || ''}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={autogrow ? 1 : rows}
        placeholder={placeholder}
        dir={direction}
        aria-invalid={!!error}
        className={cn(
          'min-h-[80px]',
          autogrow && 'resize-none overflow-hidden',
          !autogrow && 'resize-y',
          error && 'border-destructive focus-visible:ring-destructive/50'
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export { TextareaWithLabel };
