import React from 'react';

interface InputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  placeholder,
  type = 'text',
  disabled,
  className,
  onKeyDown,
}) => {
  return (
    <div className={`flex py-3 px-5 justify-end items-center gap-2 self-stretch bg-white border border-[#E2E3E5] rounded-lg ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown}
        className="w-full text-right text-base font-normal leading-[140%] tracking-[0.56px] text-[#888C94] placeholder-gray-400 focus:outline-none font-['Noto_Sans_Hebrew']"
        id={id}
      />
    </div>
  );
};


export { Input };
