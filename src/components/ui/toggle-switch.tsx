import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {leftIcon && (
        <span className={cn(
          'transition-opacity',
          !checked ? 'opacity-100' : 'opacity-50'
        )}>
          {leftIcon}
        </span>
      )}
      {leftLabel && (
        <span className={cn(
          'text-sm font-medium transition-opacity',
          !checked ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-70'
        )}>
          {leftLabel}
        </span>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform',
            checked ? 'translate-x-8' : 'translate-x-1'
          )}
        />
      </button>
      
      {rightLabel && (
        <span className={cn(
          'text-sm font-medium transition-opacity',
          checked ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-70'
        )}>
          {rightLabel}
        </span>
      )}
      {rightIcon && (
        <span className={cn(
          'transition-opacity',
          checked ? 'opacity-100' : 'opacity-50'
        )}>
          {rightIcon}
        </span>
      )}
    </div>
  );
};