import { BoltIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

type DropdownOption = {
  value: string | number;
  label: string;
  description?: string;
};

interface CustomDropdownProps {
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null
  );
  const toggleDropdown = () => {
    if (options.length > 0) {
      setIsOpen(!isOpen);
    }
  };


  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(null); // Reset selectedOption after selection
    onSelect(option);
    setIsOpen(false);
  };
  const displayText = selectedOption
    ? selectedOption.label
    : options.length > 0
    ? 'select action'
    : 'no available actions';

  const arrowStyle = {
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s ease',
  };

  return (
    <div className="relative">
      <div
        className="cursor-pointer border p-2 rounded flex justify-between items-center"
        onClick={toggleDropdown} // Use the toggleDropdown function
      >
        <span>{displayText}</span>
        <svg
          style={arrowStyle}
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen && options.length > 0 && ( // Ensure options are available before rendering dropdown
        <div className="absolute border rounded  bg-zinc-50 z-10 mt-0.5 w-full flex flex-col space-y-1">
          {options.map((option) => (
            <div
              key={option.value}
              className="p-3 hover:bg-gray-100 cursor-pointer text-base"
              onClick={() => handleSelect(option)}
            >
              <div className="flex flex-row items-start space-x-2">
                <BoltIcon className="w-4 h-4 mt-1 flex-shrink-0 text-indigo-300" />
                <div className="flex flex-col">
                  <div className="text-zinc-800">{option.label}</div>
                  <div className="text-sm text-zinc-500">
                    {option.description || 'Description'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
