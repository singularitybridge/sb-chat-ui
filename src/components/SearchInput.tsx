import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search...' }) => { // Changed to named export
  return (
    <input
      type="text"
      className="w-full mb-2 p-2 border border-gray-300 rounded-md"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
};

// Removed default export
