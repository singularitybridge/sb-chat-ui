import React, { useEffect, useState, useRef } from 'react';
import { FileJson } from 'lucide-react';
import { ProcessingComponentProps } from './types';
import { useWorkspaceData, useWorkspaceDataStore } from '../../store/useWorkspaceDataStore';

/**
 * JsonParser - Parse JSON from text and store in outputKey
 *
 * Subscribes to input dataKey, extracts and parses JSON,
 * and stores parsed object in outputKey.
 *
 * @example
 * ```mdx
 * <JsonParser
 *   dataKey="ai_response"
 *   outputKey="parsed_json"
 *   autoExecute={true}
 * />
 * ```
 */
export const JsonParser: React.FC<Omit<ProcessingComponentProps, 'agentName' | 'query'>> = ({
  dataKey,
  outputKey,
  autoExecute = true,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data: inputData, loading: inputLoading, error: inputError } = useWorkspaceData(dataKey);
  const { setData, setError } = useWorkspaceDataStore();

  const [isParsing, setIsParsing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<number>(0);

  // Track last parsed data to prevent re-parsing same input
  const lastParsedDataRef = useRef<string | null>(null);

  const parseJson = async (data: any) => {
    if (!data) return;

    setIsParsing(true);
    setLocalError(null);

    try {
      // Convert data to string if needed
      let dataStr = typeof data === 'string' ? data : JSON.stringify(data);

      // If data is an object with text property, extract it
      if (data.text) {
        dataStr = data.text;
      }

      // Try to extract JSON from markdown code blocks
      const jsonMatch = dataStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        dataStr = jsonMatch[1];
      }

      // Parse JSON
      const parsed = JSON.parse(dataStr);

      // Store parsed result in outputKey using Zustand
      setData(outputKey, parsed, 'json-parser');
      setLastParsed(Date.now());

      // Update ref to prevent re-parsing same data
      const inputStr = typeof data === 'string' ? data : JSON.stringify(data);
      lastParsedDataRef.current = inputStr;
    } catch (error: any) {
      console.error('[JsonParser] Parse error:', error);
      setLocalError(error.message);

      // Store error state using Zustand
      setError(outputKey, error.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Auto-parse when input data changes
  useEffect(() => {
    if (autoExecute && inputData && !inputLoading && !isParsing) {
      // Convert data to string for comparison
      const dataStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

      // Only parse if data has actually changed
      if (dataStr !== lastParsedDataRef.current) {
        parseJson(inputData);
      }
    }
  }, [inputData, autoExecute, inputLoading, isParsing]);

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <FileJson className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          JSON Parser
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex gap-2">
          <span className="text-gray-500">Input:</span>
          <span className="font-mono text-purple-600">{dataKey}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500">Output:</span>
          <span className="font-mono text-blue-600">{outputKey}</span>
        </div>
      </div>

      {isParsing && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Parsing JSON...
        </div>
      )}

      {(localError || inputError) && (
        <div className="mt-2 text-sm text-red-600">
          Parse Error: {localError || inputError}
        </div>
      )}

      {lastParsed > 0 && !isParsing && !localError && !inputError && (
        <div className="mt-2 text-xs text-green-600">
          ✓ Parsed at {new Date(lastParsed).toLocaleTimeString()}
        </div>
      )}

      {!autoExecute && inputData && !isParsing && (
        <button
          onClick={() => parseJson(inputData)}
          className="mt-2 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Parse Now
        </button>
      )}
    </div>
  );
};
