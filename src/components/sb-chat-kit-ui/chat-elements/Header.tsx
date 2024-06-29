import React, { useState } from 'react';
import { CircleFadingPlus } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
  avatar: string;
  onClear: () => void;
  isHebrew: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatar,
  onClear,
  isHebrew,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const renderDescription = () => {
    if (description.length > 100 && !isExpanded) {
      return (
        <p
          className="text-sm text-[#6b7280] leading-4 "
          onClick={toggleDescription}
        >
          {`${description.substring(0, 97)}...`}
        </p>
      );
    }
    return (
      <p
        className="text-sm text-[#6b7280] leading-4"
        onClick={toggleDescription}
      >
        {description}
      </p>
    );
  };

  return (
    <div className="flex justify-between items-start space-x-3.5">
      <img
        className="w-20 rounded-full bg-slate-200 "
        src={avatar}
        alt="Avatar"
        loading="lazy"
      />

      <div className="flex-1">
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        <div className="flex items-start pb-5">{renderDescription()}</div>
      </div>
      <button
        onClick={onClear}
        className={`p-1 rounded-full transition-colors hover:bg-gray-100 ${
          isHebrew ? 'mr-auto' : 'ml-auto'
        }`}
        aria-label="Clear chat"
      >
        <CircleFadingPlus className="w-6 h-6 text-gray-500 hover:text-primary-600" />
      </button>
    </div>
  );
};

export { Header };
