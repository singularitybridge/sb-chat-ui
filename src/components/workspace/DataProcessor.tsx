import React, { useEffect, useState, useRef } from 'react';
import { Zap } from 'lucide-react';
import { ProcessingComponentProps } from './types';
import { useWorkspaceData, useWorkspaceDataStore } from '../../store/useWorkspaceDataStore';

/**
 * DataProcessor - Process data through AI agent and store result
 *
 * Subscribes to input dataKey, processes through agent when data changes,
 * and stores result in outputKey. Enables multi-agent orchestration.
 *
 * @example
 * ```mdx
 * <DataProcessor
 *   dataKey="raw_data"
 *   outputKey="processed_data"
 *   agentName="processor-agent"
 *   query="Extract key information from this data"
 *   autoExecute={true}
 * />
 * ```
 */
export const DataProcessor: React.FC<ProcessingComponentProps> = ({
  dataKey,
  outputKey,
  agentName,
  query = 'Process this data',
  autoExecute = true,
  sessionId,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data: inputData, loading: inputLoading, error: inputError } = useWorkspaceData(dataKey);
  const { setData, setError } = useWorkspaceDataStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastProcessed, setLastProcessed] = useState<number>(0);

  // Track last processed data to prevent re-processing same input
  const lastProcessedDataRef = useRef<string | null>(null);

  const processData = async (data: any) => {
    if (!data || isProcessing) return;

    setIsProcessing(true);
    setLocalError(null);

    try {
      // Check if workspace API is available
      if (typeof (window as any).workspace === 'undefined') {
        throw new Error('Workspace API not available');
      }

      const workspace = (window as any).workspace;

      // Convert data to string for query
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);

      // Build query with data context
      const fullQuery = `${query}\n\nData to process:\n${dataStr}`;

      // Execute agent
      const response = await workspace.executeAgent(agentName, fullQuery, { sessionId });

      // Store result in outputKey using Zustand
      setData(outputKey, { type: 'complete', text: response }, agentName);
      setLastProcessed(Date.now());

      // Update ref to prevent re-processing same data
      lastProcessedDataRef.current = dataStr;
    } catch (error: any) {
      console.error('[DataProcessor] Processing error:', error);
      setLocalError(error.message);

      // Store error state using Zustand
      setError(outputKey, error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process when input data changes
  useEffect(() => {
    if (autoExecute && inputData && !inputLoading && !isProcessing) {
      // Convert data to string for comparison
      const dataStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

      // Only process if data has actually changed
      if (dataStr !== lastProcessedDataRef.current) {
        processData(inputData);
      }
    }
  }, [inputData, autoExecute, inputLoading, query, isProcessing]);

  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-violet" />
        <span className="text-sm font-medium text-foreground">
          Data Processor
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex gap-2">
          <span className="text-muted-foreground">Input:</span>
          <span className="font-mono text-violet">{dataKey}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">Output:</span>
          <span className="font-mono text-primary">{outputKey}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">Agent:</span>
          <span className="font-mono text-foreground">{agentName}</span>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-2 text-sm text-primary flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Processing...
        </div>
      )}

      {(localError || inputError) && (
        <div className="mt-2 text-sm text-destructive">
          Error: {localError || inputError}
        </div>
      )}

      {lastProcessed > 0 && !isProcessing && !localError && !inputError && (
        <div className="mt-2 text-xs text-green-600">
          ✓ Processed at {new Date(lastProcessed).toLocaleTimeString()}
        </div>
      )}

      {!autoExecute && inputData && !isProcessing && (
        <button
          onClick={() => processData(inputData)}
          className="mt-2 text-sm px-3 py-1 bg-violet text-violet-foreground rounded hover:bg-violet/90 transition-colors"
        >
          Process Now
        </button>
      )}
    </div>
  );
};
