import React from 'react';
import { cn } from '../../lib/utils';

interface ContentPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'solid' | 'glass';
}

/**
 * ContentPanel - A reusable container component for consistent styling across the app
 *
 * @param variant
 *   - 'default': Translucent white background with backdrop blur (default)
 *   - 'solid': Solid white background without transparency
 *   - 'glass': More transparent glass effect
 */
export const ContentPanel: React.FC<ContentPanelProps> = ({
  children,
  className,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-background/95 backdrop-blur-sm',
    solid: 'bg-background',
    glass: 'bg-background/60 backdrop-blur-md',
  };

  return (
    <div className={cn(
      'rounded-2xl shadow-lg overflow-hidden',
      variantStyles[variant],
      className
    )}>
      {children}
    </div>
  );
};
