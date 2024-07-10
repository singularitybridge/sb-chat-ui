import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { TextComponent } from './TextComponent';

export type SelectListOption = {
  value: string | number;
  label: string;
  description?: string;
};

interface SelectListProps {
  label: string;
  options: SelectListOption[];
  onSelect: (value: string | number) => void;
  initialValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SelectList: React.FC<SelectListProps> = ({
  label,
  options,
  onSelect,
  initialValue,
  placeholder = 'Select an option',
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number | undefined>(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!disabled && options.length > 0) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleSelect = (value: string | number) => {
    setSelectedValue(value);
    onSelect(value);
    setIsOpen(false);
    setIsFocused(false);
  };

  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div>
      <div className="mb-1">
        <TextComponent text={label} size="small" color="normal" />
      </div>

      <div className="flex flex-col w-full" ref={selectRef}>
        <div
          className={clsx(
            'relative flex py-3 px-5 justify-between items-center gap-2 self-stretch bg-white rounded-lg transition-all duration-200',
            {
              'border border-gray-400': isFocused,
              'border border-gray-300': !isFocused,
              'opacity-50': disabled,
            },
            className
          )}
          onClick={toggleSelect}
        >
          <div
            className={clsx(
              'w-full text-base font-normal leading-[140%] tracking-[0.56px] cursor-pointer',
              {
                'text-gray-800': selectedValue && !disabled,
                'text-gray-400': !selectedValue || disabled,
              }
            )}
          >
            {displayText}
          </div>
          <ChevronDownIcon
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform duration-200 cursor-pointer',
              {
                'transform rotate-180': isOpen,
              }
            )}
          />
          {isOpen && options.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg top-full">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="p-3 hover:bg-gray-100 cursor-pointer text-base"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="text-gray-800">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500">{option.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};