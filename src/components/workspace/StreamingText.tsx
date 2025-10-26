import React, { useEffect, useState } from 'react';
import { DisplayComponentProps } from './types';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * StreamingText - Display streaming text data with typing animation
 *
 * Subscribes to dataKey and displays text with real-time streaming updates.
 * Shows cursor animation during streaming.
 *
 * @example
 * ```mdx
 * <StreamingText
 *   dataKey="ai_response"
 *   showLoading={true}
 * />
 * ```
 */
export const StreamingText: React.FC<DisplayComponentProps> = ({
  dataKey,
  fallback = 'Waiting for response...',
  showLoading = true,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data, loading, error } = useWorkspaceData(dataKey);
  const [isStreaming, setIsStreaming] = useState(false);

  // Track streaming state based on data changes
  useEffect(() => {
    if (data?.type === 'streaming') {
      setIsStreaming(true);
    } else if (data?.type === 'complete') {
      setIsStreaming(false);
    }
  }, [data]);

  // Extract text from data
  const getText = (): string => {
    if (!data) return '';

    // Handle different data formats
    if (typeof data === 'string') return data;
    if (data.text) return data.text;

    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      {loading && showLoading && (
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && data && (
        <div className="prose prose-sm max-w-none relative">
          <div className="whitespace-pre-wrap">
            {getText()}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-gray-500 italic">{fallback}</div>
      )}

      {isStreaming && (
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Streaming...
        </div>
      )}
    </div>
  );
};
