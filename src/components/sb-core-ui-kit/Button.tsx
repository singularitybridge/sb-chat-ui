import React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  additionalClassName?: string;
  children: React.ReactNode;
  isArrowButton?: boolean;
}

const ArrowIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
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

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  additionalClassName,
  children,
  isArrowButton = false,
}) => {
  const className = clsx(
    'text-white text-base',
    'bg-primary',
    'px-6 py-3',
    'rounded-xl',
    'flex items-center justify-center gap-2',
    additionalClassName
  );

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
      {isArrowButton && <ArrowIcon />}
    </button>
  );
};

export default Button;