import React from 'react';
import classNames from 'classnames';

interface TextComponentProps {
  text: string;
  size: 'normal' | 'title';
  color?: 'normal' | 'alert';
  className?: string;
}

const TextComponent: React.FC<TextComponentProps> = ({ text, size, color = 'normal', className }) => {
  const textClass = classNames(
    {
      'text-base text-center font-normal leading-[1.4] tracking-[0.56px] text-[#111828]': size === 'normal' && color === 'normal',
      'text-2xl text-center font-black leading-[1.4] tracking-[1.08px] text-[#111828]': size === 'title' && color === 'normal',
      'text-base text-center font-normal leading-[1.4] tracking-[0.56px] text-red-500': size === 'normal' && color === 'alert',
      'text-2xl text-center font-black leading-[1.4] tracking-[1.08px] text-red-500': size === 'title' && color === 'alert',
    },
    className // Add the custom className prop here
  );

  return <div className={textClass}>{text}</div>;
};

export { TextComponent };
