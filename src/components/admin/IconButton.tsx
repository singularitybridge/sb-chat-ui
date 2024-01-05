import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: (event?: any) => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  className,
}) => {
  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
    </button>
  );
};

export { IconButton };
