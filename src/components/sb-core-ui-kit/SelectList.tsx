import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

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
  options = [],
  onSelect,
  initialValue,
  placeholder = 'Select an option',
  disabled,
  className,
}) => {
  const handleValueChange = (value: string) => {
    // Try to preserve the original type (number or string)
    const originalOption = options.find(opt => String(opt.value) === value);
    if (originalOption) {
      onSelect(originalOption.value);
    } else {
      onSelect(value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <Select
        value={initialValue !== undefined ? String(initialValue) : undefined}
        onValueChange={handleValueChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger className="w-full h-11">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
            >
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
