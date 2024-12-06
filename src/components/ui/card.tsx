import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`px-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ className = '', children }) => (
  <h2 className={`text-xl font-semibold ${className}`}>
    {children}
  </h2>
);

export const CardContent: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`px-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`px-6 ${className}`}>
    {children}
  </div>
);
