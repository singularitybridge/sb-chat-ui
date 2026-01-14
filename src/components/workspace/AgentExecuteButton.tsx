import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { InputComponentProps } from './types';

/**
 * AgentExecuteButton - Manual agent execution with button trigger
 *
 * Unlike AgentExecute, this component only executes when the button is clicked.
 * Useful for testing interfaces where auto-execution would overwhelm the system.
 *
 * @example
 * ```mdx
 * <AgentExecuteButton
 *   dataKey="test_result"
 *   agentName="validation-guru"
 *   query="Generate validation checklist for MON.04"
 *   buttonText="Generate Checklist"
 * />
 * ```
 */
export const AgentExecuteButton: React.FC<InputComponentProps & { buttonText?: string }> = ({
  dataKey,
  agentName,
  query = '',
  stream = false,
  sessionId,
  buttonText = 'Execute',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false);
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
      setHasExecuted(true);
    } catch (error: any) {
      console.error('[AgentExecuteButton] Execution error:', error);
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

  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-violet" />
          <span className="text-sm font-medium text-foreground">
            Agent: <span className="text-violet">{agentName}</span>
          </span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-mono bg-secondary p-2 rounded mb-3">
        {query}
      </div>

      <button
        onClick={executeAgent}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-violet hover:bg-violet/90 text-violet-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            {hasExecuted ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {hasExecuted ? `Re-${buttonText}` : buttonText}
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 text-sm bg-destructive/10 p-2 rounded border border-destructive/30">
          <span className="text-destructive font-medium">Error:</span>{' '}
          <span className="text-foreground">{error}</span>
        </div>
      )}

      {lastExecuted > 0 && !isLoading && !error && (
        <div className="mt-3 text-xs text-success-foreground flex items-center gap-1">
          <span className="font-bold">✓</span> Executed at {new Date(lastExecuted).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
