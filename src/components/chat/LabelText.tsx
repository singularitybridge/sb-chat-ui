import React from 'react';

interface LabelTextProps {
  label: React.ReactNode;
  text: string | number | React.ReactNode;
  labelVerticalAlign?: 'top' | 'center';
  layout?: 'horizontal' | 'vertical';
}

const LabelText: React.FC<LabelTextProps> = ({
  label,
  text,
  labelVerticalAlign = 'center',
  layout = 'horizontal',
}) => {
  const containerClass = layout === 'vertical' ? 'flex-col' : 'flex';
  const itemAlignClass =
    layout === 'vertical' || labelVerticalAlign === 'top'
      ? 'items-start'
      : 'items-center';
  return (
    <div className={`flex ${containerClass} ${itemAlignClass}`}>
      <div className="">{label}</div>
      <div>{text}</div>
    </div>
  );
};

export { LabelText };
