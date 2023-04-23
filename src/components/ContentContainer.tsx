import React from 'react';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string; // Add an optional className prop
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children, className }) => {
  // Set a default value for the className prop, then add any additional classes from the passed-in className
  const defaultClasses = "flex-1 overflow-y-scroll antialiased";
  const mergedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;

  return (
    <main className={mergedClasses}>{children}</main>
  );
};

export { ContentContainer };
