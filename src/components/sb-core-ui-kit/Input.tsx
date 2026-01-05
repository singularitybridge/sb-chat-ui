import React, { useState } from 'react';
import clsx from 'clsx';

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
  error?: string;
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
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={clsx(
          'flex py-3 px-5 justify-end items-center gap-2 self-stretch bg-white rounded-lg transition-all duration-200',
          {
            'border border-gray-400': isFocused && !error,
            'border border-red-500': error,
            'border border-gray-300': !isFocused && !error,
            'opacity-50': disabled,
          },
          className
        )}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className={clsx(
            'w-full rtl:text-right lrt:text-left text-base font-normal leading-[140%] tracking-[0.56px] focus:outline-hidden bg-transparent',
            {
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
};

export { Input };