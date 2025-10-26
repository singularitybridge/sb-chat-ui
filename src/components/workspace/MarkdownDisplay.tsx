import React from 'react';
import { DisplayComponentProps } from './types';
import ReactMarkdown from 'react-markdown';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * MarkdownDisplay - Display markdown-formatted text
 *
 * Subscribes to dataKey and renders markdown content with formatting.
 * Updates automatically when data changes.
 *
 * @example
 * ```mdx
 * <MarkdownDisplay
 *   dataKey="formatted_response"
 *   showLoading={true}
 * />
 * ```
 */
export const MarkdownDisplay: React.FC<DisplayComponentProps> = ({
  dataKey,
  fallback = 'No content available',
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
    <div className={`space-y-1.5 ${className}`}>
      {/* Content area - minimal, flat */}
      <div className="min-h-[2rem]">
        {loading && showLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown>{getText()}</ReactMarkdown>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="text-slate-400 text-sm italic">{fallback}</div>
        )}
      </div>

      {/* Data flow info */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
        <span>←</span>
        <span>{dataKey}</span>
      </div>
    </div>
  );
};
