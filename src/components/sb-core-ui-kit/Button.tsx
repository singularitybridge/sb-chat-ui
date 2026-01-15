import React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  additionalClassName?: string;
  children: React.ReactNode;
  isArrowButton?: boolean;
  size?: 'small' | 'normal' | 'large';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const ArrowIcon: React.FC<{ size: 'small' | 'normal' | 'large' }> = ({ size }) => {
  const iconSize = size === 'small' ? 16 : size === 'normal' ? 18 : 20;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize}
      height={iconSize}
      viewBox="0 0 20 20"
      fill="none"     
    >
      <path
        d="M8.75 16.25L2.5 10M2.5 10L8.75 3.75M2.5 10L17.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  additionalClassName,
  children,
  isArrowButton = false,
  size = 'normal',
  disabled = false,
  variant = 'primary',
}) => {
  const sizeClasses = {
    small: 'text-sm px-4 py-2',
    normal: 'text-base px-5 py-2.5',
    large: 'text-lg px-6 py-3',
  };

  const variantClasses = {
    primary: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      disabled: 'bg-muted text-muted-foreground',
    },
    secondary: {
      default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      disabled: 'bg-muted text-muted-foreground',
    },
  };

  const className = clsx(
    'rounded-xl',
    'flex items-center justify-center',
    'transition-colors duration-200',
    sizeClasses[size],
    {
      [variantClasses[variant].default]: !disabled,
      [variantClasses[variant].disabled]: disabled,
      'cursor-not-allowed': disabled,
    },
    additionalClassName
  );

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={className}
      disabled={disabled}
    >
      <span className="flex items-center rtl:flex-row-reverse gap-2">
        {isArrowButton && <ArrowIcon size={size} />}
        {children}
      </span>
    </button>
  );
};

export default Button;