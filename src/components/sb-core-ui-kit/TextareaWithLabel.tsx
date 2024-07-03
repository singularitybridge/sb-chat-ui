import React from 'react';
import { Textarea } from './Textarea';
import { TextComponent } from './TextComponent';

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
}

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
  autogrow=false
}) => {

  return (
    <div className="mb-4">
      <div className="mb-2">
        <TextComponent
          text={label}
          size="small"
          color="normal"          
        />
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        error={error}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        autogrow={autogrow}
      />
    </div>
  );
};

export { TextareaWithLabel };