import React from 'react';
import { IconButton } from './admin/IconButton';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TagInputProps {
  title: string;
  onRemove: (title: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ title, onRemove }) => {
  return (
    <span className="tag inline-flex items-center bg-violet-100  text-slate-700 text-sm font-normal  mr-2.5 px-3 py-1.5 rounded-xl">
      {title}
      <IconButton
        icon={<XMarkIcon className="ml-3 w-3 h-3 text-stone-900" />}
        onClick={() => onRemove(title)}
      />
    </span>
  );
};

export { TagInput };
