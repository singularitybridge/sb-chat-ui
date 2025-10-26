import React, { useEffect, useState, useRef } from 'react';
import { Filter } from 'lucide-react';
import { BaseReactiveProps } from './types';
import { useWorkspaceData, useWorkspaceDataStore } from '../../store/useWorkspaceDataStore';

interface DataFilterProps extends BaseReactiveProps {
  /** Output data key (where to store filtered result) */
  outputKey: string;
  /** Filter function as string (will be evaluated) */
  filter: string;
  /** Auto-execute when input data changes */
  autoExecute?: boolean;
}

/**
 * DataFilter - Filter data using JavaScript expression
 *
 * Subscribes to input dataKey, applies filter function,
 * and stores filtered result in outputKey.
 *
 * @example
 * ```mdx
 * <DataFilter
 *   dataKey="products"
 *   outputKey="expensive_products"
 *   filter="item => item.price > 100"
 *   autoExecute={true}
 * />
 * ```
 */
export const DataFilter: React.FC<DataFilterProps> = ({
  dataKey,
  outputKey,
  filter,
  autoExecute = true,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data: inputData, loading: inputLoading, error: inputError } = useWorkspaceData(dataKey);
  const { setData, setLoading, setError } = useWorkspaceDataStore();

  const [isFiltering, setIsFiltering] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastFiltered, setLastFiltered] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  // Track last filtered data to prevent re-filtering same input
  const lastFilteredDataRef = useRef<string | null>(null);

  const filterData = async (data: any) => {
    if (!data) return;

    setIsFiltering(true);
    setLocalError(null);

    try {
      // Ensure data is an array
      let dataArray = Array.isArray(data) ? data : [data];

      // If data has a nested array property, use it
      if (data.items && Array.isArray(data.items)) {
        dataArray = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        dataArray = data.data;
      }

      // Create filter function from string
      const filterFn = new Function('item', 'index', 'array', `return ${filter}`);

      // Apply filter
      const filtered = dataArray.filter((item: any, index: number, array: any[]) => {
        try {
          return filterFn(item, index, array);
        } catch (error) {
          console.error('[DataFilter] Filter function error:', error);
          return false;
        }
      });

      setFilteredCount(filtered.length);

      // Store filtered result in outputKey using Zustand
      setData(outputKey, filtered, 'data-filter');
      setLastFiltered(Date.now());

      // Update ref to prevent re-filtering same data
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      lastFilteredDataRef.current = dataStr;
    } catch (error: any) {
      console.error('[DataFilter] Filtering error:', error);
      setLocalError(error.message);

      // Store error state using Zustand
      setError(outputKey, error.message);
    } finally {
      setIsFiltering(false);
    }
  };

  // Auto-filter when input data changes
  useEffect(() => {
    if (autoExecute && inputData && !inputLoading && !isFiltering) {
      // Convert data to string for comparison
      const dataStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

      // Only filter if data has actually changed
      if (dataStr !== lastFilteredDataRef.current) {
        filterData(inputData);
      }
    }
  }, [inputData, autoExecute, inputLoading, filter, isFiltering]);

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">
          Data Filter
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
        <div className="bg-gray-50 p-2 rounded mt-2">
          <div className="text-gray-500 mb-1">Filter:</div>
          <code className="text-xs text-gray-700">{filter}</code>
        </div>
      </div>

      {isFiltering && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Filtering...
        </div>
      )}

      {(localError || inputError) && (
        <div className="mt-2 text-sm text-red-600">
          Error: {localError || inputError}
        </div>
      )}

      {lastFiltered > 0 && !isFiltering && !localError && !inputError && (
        <div className="mt-2 text-xs text-green-600">
          ✓ Filtered {filteredCount} items at {new Date(lastFiltered).toLocaleTimeString()}
        </div>
      )}

      {!autoExecute && inputData && !isFiltering && (
        <button
          onClick={() => filterData(inputData)}
          className="mt-2 text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Filter Now
        </button>
      )}
    </div>
  );
};
