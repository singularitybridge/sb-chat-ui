import React from 'react';
import { IconButton } from './admin/IconButton';
import { BeakerIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TagInputProps {
  title: string;
  onRemove: (title: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ title, onRemove }) => {
  return (
    <span className={'tag inline-flex items-center bg-primary-100  text-slate-700 mr-2.5 px-3 py-2 rounded-2xl'}>
      {title}
      <IconButton
        icon={<XMarkIcon className="ml-5 w-4 h-4 text-stone-900" />}
        onClick={() => onRemove(title)}
      />
      <IconButton
        icon={<BeakerIcon className="ml-1 w-4 h-4 text-stone-900" />}
        onClick={() => onRemove(title)}
      />
    </span>
  );
};

export { TagInput };
