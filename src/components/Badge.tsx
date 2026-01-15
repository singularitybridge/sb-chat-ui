import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-accent text-foreground dark:bg-accent dark:text-foreground',
  primary: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  secondary: 'bg-zinc-300 text-slate-800 dark:bg-zinc-700 dark:text-slate-200',
  success: 'bg-lime-200 bg-opacity-70 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
  return (
    <span className={clsx(
      'text-xs font-base px-2 py-0.5 rounded-xl whitespace-nowrap rtl:space-x-reverse',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
