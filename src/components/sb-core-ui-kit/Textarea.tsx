import React from 'react';

interface TextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  placeholder,
  disabled,
  className,
  rows = 3,
  maxLength,
  onKeyDown,
}) => {
  return (
    <div className={`flex py-4 px-5 justify-end items-center gap-2 self-stretch bg-white border border-[#E2E3E5] rounded-lg ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown}
        rows={rows}
        maxLength={maxLength}
        className="w-full text-right text-base font-normal leading-[140%] tracking-[0.56px] text-[#888C94] placeholder-gray-400 focus:outline-none font-['Noto_Sans_Hebrew'] resize-none"
        id={id}
      />
    </div>
  );
};

export { Textarea };