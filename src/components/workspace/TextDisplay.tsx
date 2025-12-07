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
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      {loading && showLoading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{getText()}</div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-gray-500 italic">{fallback}</div>
      )}
    </div>
  );
};
