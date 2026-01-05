import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCcw } from 'lucide-react';
import InputWithLabel from '../sb-core-ui-kit/InputWithLabel';

interface TokenInputProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onRefresh,
  autoFocus,
  error,
  disabled,
}) => {
  const [inputType, setInputType] = useState<'text' | 'password'>(type);

  const toggleVisibility = () => {
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="relative">
      <InputWithLabel
        id={id}
        label={label}
        type={inputType}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        error={error}
        disabled={disabled}
      />
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={toggleVisibility}
          className="p-2 text-neutral-500 hover:text-primary focus:outline-hidden focus:ring-2 focus:ring-primary rounded"
        >
          {inputType === 'password' ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-neutral-500 hover:text-primary focus:outline-hidden focus:ring-2 focus:ring-primary rounded"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenInput;
