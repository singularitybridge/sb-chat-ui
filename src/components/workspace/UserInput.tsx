import React, { useState } from 'react';
import { Send, RefreshCw, Sparkles } from 'lucide-react';
import { InputComponentProps } from './types';
import { useWorkspaceDataStore } from '../../store/useWorkspaceDataStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * UserInput - Interactive input component that executes AI agents
 *
 * Sends user input to specified agent and stores result in dataKey.
 * Other components can subscribe to the same dataKey for reactive updates.
 *
 * @example
 * ```mdx
 * <UserInput
 *   dataKey="product_search"
 *   agentName="search-agent"
 *   placeholder="Search for products..."
 *   buttonText="Search"
 * />
 * ```
 */
export const UserInput: React.FC<InputComponentProps> = ({
  dataKey,
  agentName,
  query: defaultQuery = '',
  placeholder = 'Enter your query...',
  buttonText = 'Submit',
  stream = false,
  sessionId,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(defaultQuery);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Check if workspace API is available
    if (typeof (window as any).workspace === 'undefined') {
      console.error('[UserInput] Workspace API not available');
      return;
    }

    const workspace = (window as any).workspace;

    setIsLoading(true);

    // Use workspace API for loading state (always get fresh state)
    useWorkspaceDataStore.getState().setLoading(dataKey, true);

    try {
      // Execute agent
      let response: string;
      if (stream) {
        response = await workspace.executeAgentStream(
          agentName,
          inputValue,
          (chunk: string, fullText: string) => {
            // Update data with streaming chunks using workspace API
            workspace.setData(dataKey, { type: 'streaming', text: fullText }, agentName);
          },
          { sessionId }
        );
      } else {
        response = await workspace.executeAgent(agentName, inputValue, { sessionId });
      }

      // Store final result using workspace API (ensures fresh state)
      await workspace.setData(dataKey, { type: 'complete', text: response }, agentName);
      useWorkspaceDataStore.getState().setLoading(dataKey, false);
    } catch (error: any) {
      console.error('[UserInput] Execution error:', error);
      // Store error state using workspace API
      useWorkspaceDataStore.getState().setError(dataKey, error.message);
      useWorkspaceDataStore.getState().setLoading(dataKey, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    if (isLoading || !inputValue.trim()) return;

    // Re-execute with the current input value
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Input with inline buttons */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full h-9 pl-3 pr-16 rounded-md border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Inline buttons */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReload}
              disabled={isLoading || !inputValue.trim()}
              title="Reload"
              className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              title={buttonText}
              className="h-8 w-8 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Data flow info */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
        <span>{dataKey}</span>
        <span>→</span>
        <span>{agentName}</span>
      </div>
    </div>
  );
};
