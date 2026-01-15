import React from 'react';
import { DisplayComponentProps } from './types';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * TextDisplay - Display text data from reactive store
 *
 * Subscribes to dataKey and displays text content reactively.
 * Updates automatically when data changes.
 *
 * @example
 * ```mdx
 * <TextDisplay
 *   dataKey="product_search"
 *   showLoading={true}
 *   fallback="No results yet"
 * />
 * ```
 */
export const TextDisplay: React.FC<DisplayComponentProps> = ({
  dataKey,
  fallback = 'No data available',
  showLoading = true,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data, loading, error } = useWorkspaceData(dataKey);

  // Extract text from data
  const getText = (): string => {
    if (!data) return '';

    // Handle different data formats
    if (typeof data === 'string') return data;
    if (data.text) return data.text;
    if (data.type === 'complete' && data.text) return data.text;
    if (data.type === 'streaming' && data.text) return data.text;

    // Fallback to JSON stringify
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      {loading && showLoading && (
        <div className="flex items-center gap-2 text-primary">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 p-3 rounded">
          <span className="text-destructive font-medium">Error:</span>{' '}
          <span className="text-foreground">{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{getText()}</div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-muted-foreground italic">{fallback}</div>
      )}
    </div>
  );
};
