import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  /** Size of spinner (small, medium, large) */
  size?: 'small' | 'medium' | 'large';
  /** Loading message */
  message?: string;
  /** CSS class name */
  className?: string;
}

/**
 * LoadingSpinner - Reusable loading indicator
 *
 * Displays a spinner with optional loading message.
 *
 * @example
 * ```mdx
 * <LoadingSpinner size="medium" message="Loading data..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const iconSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
      <Loader2 className={`${iconSize} animate-spin`} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
};
