import React, {  } from 'react';

interface TagInputProps {
  title: string;
  onRemove: (title: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ title, onRemove }) => {
  return (
    <span className="tag inline-flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 px-3 py-1 rounded-lg dark:bg-gray-600 dark:text-gray-300">
      {title}
      <button
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        onClick={() => onRemove(title)}
      >
        ×
      </button>
    </span>
  );
};

export { TagInput }
