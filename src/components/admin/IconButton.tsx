import React from 'react';

interface IconButtonProps {
  id?: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: (event?: any) => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  id,
  icon,
  disabled,
  onClick,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      id={id}
      type="button"
      onClick={onClick}
      className={className}
    >
      {icon}
    </button>
  );
};

export { IconButton };
