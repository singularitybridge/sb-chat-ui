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
      return <div className="text-foreground">{item}</div>;
    }

    if (typeof item === 'object') {
      return (
        <div className="text-sm">
          {item.name && <div className="font-medium text-foreground">{item.name}</div>}
          {item.title && <div className="font-medium text-foreground">{item.title}</div>}
          {item.description && <div className="text-muted-foreground mt-1">{item.description}</div>}
        </div>
      );
    }

    return <div className="text-foreground">{String(item)}</div>;
  };

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={`border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <List className="w-4 h-4 text-violet" />
        <span className="text-sm font-medium text-foreground">
          Data List ({items.length} items)
        </span>
      </div>

      {loading && showLoading && (
        <div className="flex items-center gap-2 text-primary p-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive bg-destructive/10 p-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-muted-foreground italic p-4">{emptyMessage}</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div key={index} className="p-4 hover:bg-accent transition-colors">
              {itemRenderer(item, index)}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-muted-foreground italic p-4">{fallback}</div>
      )}
    </div>
  );
};
