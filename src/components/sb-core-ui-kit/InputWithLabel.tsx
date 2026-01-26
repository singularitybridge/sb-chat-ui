import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

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
  placeholder?: string;
  className?: string;
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
  placeholder,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn(
          'h-11',
          error && 'border-destructive focus-visible:ring-destructive/50'
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default InputWithLabel;
