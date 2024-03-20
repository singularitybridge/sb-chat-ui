import React from 'react';

interface Input {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

const Input: React.FC<Input> = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
}) => {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        className="w-full text-sm h-9 p-3 block rounded-md border-0  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
        id={id}
      />
    </div>
  );
};

export { Input };
