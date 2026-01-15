import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  /** Error message */
  error: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** CSS class name */
  className?: string;
}

/**
 * ErrorDisplay - Reusable error display component
 *
 * Displays error message with optional retry button.
 *
 * @example
 * ```mdx
 * <ErrorDisplay
 *   error="Failed to load data"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-destructive/10 border border-destructive/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive mb-1">Error</h3>
          <p className="text-sm text-foreground">{error}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center gap-2 text-sm text-destructive hover:text-destructive/90 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
