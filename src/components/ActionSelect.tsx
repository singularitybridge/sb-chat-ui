import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Icon } from './ActionTag';

export interface ActionOption {
  id: string;
  name: string;
  iconName: string;
  title: string;
  description: string;
  serviceName: string;
}

interface ActionSelectProps {
  label: string;
  options: ActionOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ActionSelect: React.FC<ActionSelectProps> = ({
  label,
  options,
  onSelect,
  placeholder = 'Select an action',
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSelect = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.id === selectedValue);

  return (
    <div className={className} ref={selectRef}>
      <TextComponent text={label} size="small" color="normal" />
      <div
        className={clsx(
          'mt-1 relative border rounded-md',
          disabled ? 'bg-gray-100' : 'bg-white',
          isOpen ? 'border-blue-500' : 'border-gray-300'
        )}
      >
        <div
          className="flex justify-between items-center p-2 cursor-pointer"
          onClick={toggleSelect}
        >
          <div className="flex items-center">
            {selectedOption ? (
              <>
                <Icon name={selectedOption.iconName} className="mr-2 w-5 h-5" />
                <span>{selectedOption.name}</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className={clsx('w-5 h-5 text-gray-400', isOpen && 'transform rotate-180')} />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option.id)}
              >
                <div className="flex items-center">
                  <Icon name={option.iconName} className="mr-2 w-5 h-5" />
                  <span className="font-medium">{option.title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                <p className="text-xs text-gray-400 mt-1">{option.serviceName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};