import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MDXIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * MDX Icon component for rendering Lucide icons in MDX files
 * Usage: <Icon name="brain" size={20} />
 */
export const MDXIcon: React.FC<MDXIconProps> = ({
  name,
  size = 20,
  className = '',
  strokeWidth = 2
}) => {
  // Convert kebab-case or lowercase to PascalCase for Lucide icon names
  const iconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;

  if (!IconComponent) {
    console.warn(`Icon "${name}" (converted to "${iconName}") not found in Lucide icons`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`inline-block align-text-bottom ${className}`}
      aria-hidden="true"
    />
  );
};
