import React from 'react';
import classNames from 'classnames';

interface TextComponentProps {
  text: string;
  size: 'normal' | 'title' | 'subtitle';
  color?: 'normal' | 'alert' | 'info' | 'bright';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const TextComponent: React.FC<TextComponentProps> = ({ 
  text, 
  size, 
  color = 'normal', 
  align = 'center',
  className 
}) => {
  const baseClasses = {
    normal: 'text-base font-normal tracking-[0.56px]',
    title: 'text-2xl font-black tracking-[1.08px]',
    subtitle: 'text-xl font-normal tracking-[0.56px]'
  };

  const colorClasses = {
    normal: 'text-[#111828]',
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
    alignClasses[align],
    className
  );

  return <div className={textClass}>{text}</div>;
};

export { TextComponent };