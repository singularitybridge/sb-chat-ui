import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import ActionTag from './ActionTag';
import { SearchInput } from './SearchInput'; // Changed to named import
import ActionOptionsList from './ActionOptionsList';

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
  const [activeServiceName, setActiveServiceName] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveServiceName('');
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
    setActiveServiceName('');
  };

  const handleOptionHover = (option: ActionOption) => {
    setActiveServiceName(option.serviceName);
  };

  const selectedOption = options.find(option => option.id === selectedValue);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className} ref={selectRef}>
      <TextComponent text={label} size="small" color="normal" />
      <div
        className={clsx(
          'mt-1 relative border rounded-md',
          disabled ? 'bg-secondary' : 'bg-background',
          isOpen ? 'border-ring' : 'border-border'
        )}
      >
        <div
          className="flex justify-between items-center p-2 cursor-pointer"
          onClick={toggleSelect}
        >
          <div className="flex items-center">
            {selectedOption ? (
              <ActionTag
                iconName={selectedOption.iconName}
                title={selectedOption.title}
                description={selectedOption.description}
                serviceName={selectedOption.serviceName}
                className="p-0 bg-transparent"
              />
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon
            className={clsx('w-5 h-5 text-muted-foreground', isOpen && 'transform rotate-180')}
          />
        </div>
        {isOpen && (
          <div className="mt-1 bg-background border-t border-border rounded-b-md shadow-inner">
            <div className="p-2">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-background z-10">
                {/* Search Input */}
                <SearchInput value={searchTerm} onChange={setSearchTerm} />
                {/* Active Service Name */}
                {activeServiceName && (
                  <div className="text-sm text-muted-foreground bg-info p-2 rounded-xl mb-1">{activeServiceName}</div>
                )}
              </div>
              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                <ActionOptionsList
                  options={filteredOptions}
                  onSelect={handleSelect}
                  onHover={handleOptionHover}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
