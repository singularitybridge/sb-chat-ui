import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-200 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-blue-100 text-slate-800',
  success: 'bg-lime-100 text-lime-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
  return (
    <span className={clsx(
      "text-xs font-base px-2 py-0.5 rounded-xl whitespace-nowrap rtl:space-x-reverse",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
