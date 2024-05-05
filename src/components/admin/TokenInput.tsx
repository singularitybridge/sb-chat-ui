import React, { useState } from 'react';
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineReload,
} from 'react-icons/ai';

interface TokenInputProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  autoFocus?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onRefresh,
  autoFocus,
}) => {
  const [inputType, setInputType] = useState<'text' | 'password'>(type);

  const toggleVisibility = () => {
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="relative mb-2">
      <div className="flex items-center border border-neutral-300 rounded">
        <input
          type={inputType}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="peer m-0 block h-14 w-full rounded bg-transparent bg-clip-padding px-3 py-4 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
          id={id}
          placeholder={label}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="p-2 text-neutral-500 hover:text-primary focus:outline-none focus:border-primary focus:ring-primary"
        >
          {inputType === 'password' ? (
            <AiOutlineEyeInvisible />
          ) : (
            <AiOutlineEye />
          )}
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-neutral-500 hover:text-primary focus:outline-none focus:border-primary focus:ring-primary"
          >
            <AiOutlineReload />
          </button>
        )}
      </div>
      <label
        htmlFor={id}
        className="absolute left-3 top-3 text-sm text-neutral-500 transition-all duration-200 ease-linear peer-placeholder-shown:opacity-0 peer-focus:opacity-0"
      >
        {label}
      </label>
    </div>
  );
};

export default TokenInput;
