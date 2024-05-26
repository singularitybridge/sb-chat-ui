import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import logo from '../../../assets/l3.png';

interface HeaderProps {
  title: string;
  description: string;
  onMinimize?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, description, onMinimize }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const renderDescription = () => {
    if (description.length > 100 && !isExpanded) { // Assuming 100 characters as roughly 2 lines
      return (
        <p className="text-sm text-[#6b7280] leading-4 cursor-pointer" onClick={toggleDescription}>
          {`${description.substring(0, 97)}...`}
        </p>
      );
    }
    return (
      <p className="text-sm text-[#6b7280] leading-4 cursor-pointer" onClick={toggleDescription}>
        {description}
      </p>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center space-y-2 space-x-3 pb-2">
        <img
          className="h-10 bg-lime-200 rounded-full mt-2 p-2"
          src={logo}
          loading="lazy"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-gray-200 rounded-full p-2 hover:bg-gray-300"
            onClick={onMinimize}
          >
            <ChevronDownIcon className="h-3 w-3 text-gray-700" />
          </button>
        </div>
      </div>
      <div className="flex items-start pb-5">
        {renderDescription()}
      </div>
    </>
  );
};

export { Header };
