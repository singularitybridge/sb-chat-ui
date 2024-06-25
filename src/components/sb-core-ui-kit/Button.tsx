import React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  additionalClassName?: string;
  children: React.ReactNode;
  isArrowButton?: boolean;
  size?: 'small' | 'normal' | 'large';
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
}) => {
  const sizeClasses = {
    small: 'text-sm px-4 py-2',
    normal: 'text-base px-5 py-2.5',
    large: 'text-lg px-6 py-3',
  };

  const className = clsx(
    'text-white',
    'bg-primary',
    sizeClasses[size],
    'rounded-xl',
    'flex items-center justify-center gap-2',
    additionalClassName
  );

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
      {isArrowButton && <ArrowIcon size={size} />}
    </button>
  );
};

export default Button;