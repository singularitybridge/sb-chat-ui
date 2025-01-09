import React from 'react';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ className = '', children }) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertProps> = ({ className = '', children }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);
