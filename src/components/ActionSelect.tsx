import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import ActionTag from './ActionTag';

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
  const [searchTerm, setSearchTerm] = useState('');
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
    setSearchTerm(''); // Reset search term after selection
  };

  const selectedOption = options.find(option => option.id === selectedValue);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group options by serviceName
  const groupedOptions = filteredOptions.reduce((groups: { [key: string]: ActionOption[] }, option) => {
    const group = groups[option.serviceName] || [];
    group.push(option);
    groups[option.serviceName] = group;
    return groups;
  }, {});

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
                <ActionTag
                  iconName={selectedOption.iconName}
                  title={selectedOption.title}
                  description={selectedOption.description}
                  serviceName={selectedOption.serviceName}
                  className="p-0 bg-transparent"
                />
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className={clsx('w-5 h-5 text-gray-400', isOpen && 'transform rotate-180')} />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              {/* Search Input */}
              <input
                type="text"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {/* Options */}
              {Object.keys(groupedOptions).length === 0 ? (
                <div className="text-center text-gray-500 py-2">No results found</div>
              ) : (
                Object.entries(groupedOptions).map(([serviceName, options]) => (
                  <div key={serviceName}>
                    <div className="px-2 py-1 mt-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md">
                      {serviceName}
                    </div>
                    {options.map(option => (
                      <div
                        key={option.id}
                        className="mt-1 cursor-pointer"
                        onClick={() => handleSelect(option.id)}
                      >
                        <ActionTag
                          iconName={option.iconName}
                          title={option.title}
                          description={option.description}
                          serviceName={option.serviceName}
                          className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
