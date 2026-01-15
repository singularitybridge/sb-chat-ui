import React from 'react';
import { DisplayComponentProps } from './types';
import { JSONViewer } from './JSONViewer';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * JsonDisplay - Display JSON data with syntax highlighting
 *
 * Subscribes to dataKey and displays JSON content with formatting.
 * Updates automatically when data changes.
 *
 * @example
 * ```mdx
 * <JsonDisplay
 *   dataKey="product_json"
 *   showLoading={true}
 * />
 * ```
 */
export const JsonDisplay: React.FC<DisplayComponentProps> = ({
  dataKey,
  fallback = 'No JSON data available',
  showLoading = true,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data, loading, error } = useWorkspaceData(dataKey);

  // Get JSON string from data
  const getJsonString = (): string => {
    if (!data) return '';

    // If already a string, check if it's valid JSON
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
        return data;
      } catch {
        // Not valid JSON, wrap in quotes
        return JSON.stringify(data, null, 2);
      }
    }

    // Convert object to JSON string
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={className}>
      {loading && showLoading && (
        <div className="flex items-center gap-2 text-primary p-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading JSON data...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive bg-destructive/10 p-4 rounded border border-destructive/30">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && data && (
        <JSONViewer content={getJsonString()} />
      )}

      {!loading && !error && !data && (
        <div className="text-muted-foreground italic p-4 border border-border rounded">
          {fallback}
        </div>
      )}
    </div>
  );
};
