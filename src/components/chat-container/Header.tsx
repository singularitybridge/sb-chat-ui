import { ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';


interface HeaderProps {
  onReload: () => void;
  onMinimize: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReload, onMinimize }) => {
  return (
    <div className="flex justify-between items-center space-y-1.5 pb-5">
      <div>
        <h2 className="font-semibold text-lg tracking-tight">ArchitectAI</h2>
        <p className="text-sm text-[#6b7280] leading-3">
          Streamline the creation of AI agents
        </p>
      </div>
      <div className="flex space-x-2">
        <button onClick={onReload}>
          <TrashIcon className="h-5 w-5 text-gray-500" />
        </button>
        <button onClick={onMinimize}>
          <ChevronDownIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export { Header };