import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface HeaderProps {
  onMinimize: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMinimize }) => {
  return (
    <div className="flex justify-between items-start space-y-1.5 pb-5">

      <div>
        <h2 className="font-semibold text-lg tracking-tight">ArchitectAI</h2>
        <p className="text-sm text-[#6b7280] leading-3 ">
          Streamline the creation of AI agents
        </p>
      </div>
      <div className="flex space-x-2">
        <button className="bg-gray-200 rounded-full p-1 hover:bg-gray-300  " onClick={onMinimize}>
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export { Header };
