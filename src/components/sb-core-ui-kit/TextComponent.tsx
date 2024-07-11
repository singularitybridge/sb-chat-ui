import React from 'react';
import classNames from 'classnames';

interface TextComponentProps {
  text: string;
  size: 'normal' | 'title' | 'subtitle' | 'small' | 'medium';
  color?: 'normal' | 'alert' | 'info' | 'bright' | 'secondary';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const TextComponent: React.FC<TextComponentProps> = ({ 
  text, 
  size, 
  color = 'normal', 
  align,
  className 
}) => {
  const baseClasses = {
    normal: 'text-base font-normal tracking-[0.56px]',
    title: 'text-2xl font-black tracking-[1.08px]',
    subtitle: 'text-xl font-normal tracking-[0.56px]',
    medium: 'text-lg font-medium tracking-[0.56px]',
    small: 'text-sm font-normal tracking-[0.56px]'
  };

  const colorClasses = {
    normal: 'text-[#111828]',
    secondary: ' text-gray-600',
    alert: 'text-red-500',
    info: 'text-[#111828] opacity-50',
    bright: 'text-white'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const textClass = classNames(
    'leading-[1.4]',
    baseClasses[size],
    colorClasses[color],
    align && alignClasses[align],
    className
  );

  return <div className={textClass}>{text}</div>;
};

export { TextComponent };