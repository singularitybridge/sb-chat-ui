import React, { useEffect, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { InputComponentProps } from './types';

/**
 * AgentExecute - Automatically execute agent with predefined query
 *
 * Executes agent on mount or when query/agentName changes.
 * Useful for automated data fetching and processing pipelines.
 *
 * @example
 * ```mdx
 * <AgentExecute
 *   dataKey="daily_summary"
 *   agentName="summary-agent"
 *   query="Generate today's summary"
 * />
 * ```
 */
export const AgentExecute: React.FC<InputComponentProps> = ({
  dataKey,
  agentName,
  query = '',
  stream = false,
  sessionId,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecuted, setLastExecuted] = useState<number>(0);

  const executeAgent = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if workspace API is available
      if (typeof (window as any).workspace === 'undefined') {
        throw new Error('Workspace API not available');
      }

      const workspace = (window as any).workspace;

      // Set loading state
      await workspace.setData(dataKey, null, agentName);

      // Execute agent
      let response: string;
      if (stream) {
        response = await workspace.executeAgentStream(
          agentName,
          query,
          (chunk: string, fullText: string) => {
            // Update data with streaming chunks
            workspace.setData(dataKey, { type: 'streaming', text: fullText }, agentName);
          },
          { sessionId }
        );
      } else {
        response = await workspace.executeAgent(agentName, query, { sessionId });
      }

      // Store final result
      await workspace.setData(dataKey, { type: 'complete', text: response }, agentName);
      setLastExecuted(Date.now());
    } catch (error: any) {
      console.error('[AgentExecute] Execution error:', error);
      setError(error.message);

      // Store error state
      if (typeof (window as any).workspace !== 'undefined') {
        (window as any).workspace.setData(
          dataKey,
          { type: 'error', error: error.message },
          agentName
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-execute on mount and when query/agentName changes
  useEffect(() => {
    executeAgent();
  }, [query, agentName]);

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">
            Agent: <span className="text-purple-600">{agentName}</span>
          </span>
        </div>
        <button
          onClick={executeAgent}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Re-execute"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
        {query}
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Executing...
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {error}
        </div>
      )}

      {lastExecuted > 0 && !isLoading && !error && (
        <div className="mt-2 text-xs text-green-600">
          ✓ Executed at {new Date(lastExecuted).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
