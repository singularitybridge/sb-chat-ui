import React, { useState } from 'react';

interface HeaderProps {
  title: string;
  description: string;
  avatar: string; // Add avatar as a prop
  onMinimize?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatar,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const renderDescription = () => {
    if (description.length > 100 && !isExpanded) {
      // Assuming 100 characters as roughly 2 lines
      return (
        <p
          className="text-sm text-[#6b7280] leading-4 cursor-pointer"
          onClick={toggleDescription}
        >
          {`${description.substring(0, 97)}...`}
        </p>
      );
    }
    return (
      <p
        className="text-sm text-[#6b7280] leading-4 cursor-pointer"
        onClick={toggleDescription}
      >
        {description}
      </p>
    );
  };

  return (
    <>
      <div className="flex justify-between items-start space-y-2 space-x-3 ">
        <img
          className="w-14 rounded-full mt-2 p-0.5"
          src={avatar}
          alt="Avatar"
          loading="lazy"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
          <div className="flex items-start pb-5">{renderDescription()}</div>
        </div>
        <div className="flex space-x-2">
        </div>
      </div>
    </>
  );
};

export { Header };
