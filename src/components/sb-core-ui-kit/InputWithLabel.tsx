import React from 'react';
import { Input } from './Input';
import { TextComponent } from './TextComponent';

interface InputWithLabelProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  autoFocus,
  error,
  disabled,
}) => {
  return (
    <div>
      <div className="mb-1">
        <TextComponent text={label} size="small" color="normal" />
      </div>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        error={error}
        disabled={disabled}
      />
    </div>
  );
};

export default InputWithLabel;