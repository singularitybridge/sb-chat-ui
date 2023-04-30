// Button.tsx
import React from "react";
import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  additionalClassName?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  additionalClassName,
  children,
}) => {
  const className = clsx(
    "bg-primary",
    "text-white",
    "px-4",

    "py-2",
    "mr-2 mb-2",
    "rounded",
    additionalClassName
  );

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;
