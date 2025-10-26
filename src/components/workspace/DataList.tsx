import React from 'react';
import { List } from 'lucide-react';
import { ListComponentProps } from './types';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * DataList - Display array data as a list
 *
 * Subscribes to dataKey and renders array items as a list.
 * Supports custom item rendering.
 *
 * @example
 * ```mdx
 * <DataList
 *   dataKey="products"
 *   emptyMessage="No products found"
 * />
 * ```
 */
export const DataList: React.FC<ListComponentProps> = ({
  dataKey,
  fallback = 'No data available',
  showLoading = true,
  emptyMessage = 'No items to display',
  renderItem,
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data, loading, error } = useWorkspaceData(dataKey);

  // Get array from data
  const getArray = (): any[] => {
    if (!data) return [];

    // If already an array
    if (Array.isArray(data)) return data;

    // If nested in an object
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.data && Array.isArray(data.data)) return data.data;

    // Single item - wrap in array
    return [data];
  };

  const items = getArray();

  // Default item renderer
  const defaultRenderItem = (item: any, index: number) => {
    if (typeof item === 'string') {
      return <div className="text-gray-700">{item}</div>;
    }

    if (typeof item === 'object') {
      return (
        <div className="text-sm">
          {item.name && <div className="font-medium text-gray-900">{item.name}</div>}
          {item.title && <div className="font-medium text-gray-900">{item.title}</div>}
          {item.description && <div className="text-gray-600 mt-1">{item.description}</div>}
        </div>
      );
    }

    return <div className="text-gray-700">{String(item)}</div>;
  };

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <List className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">
          Data List ({items.length} items)
        </span>
      </div>

      {loading && showLoading && (
        <div className="flex items-center gap-2 text-blue-600 p-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-gray-500 italic p-4">{emptyMessage}</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              {itemRenderer(item, index)}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-gray-500 italic p-4">{fallback}</div>
      )}
    </div>
  );
};
