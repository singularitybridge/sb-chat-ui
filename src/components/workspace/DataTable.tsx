import React from 'react';
import { Table } from 'lucide-react';
import { TableComponentProps } from './types';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * DataTable - Display array data as a table
 *
 * Subscribes to dataKey and renders array items as table rows.
 * Supports custom column definitions.
 *
 * @example
 * ```mdx
 * <DataTable
 *   dataKey="products"
 *   columns={[
 *     { key: 'name', label: 'Product Name' },
 *     { key: 'price', label: 'Price' },
 *     { key: 'category', label: 'Category' }
 *   ]}
 * />
 * ```
 */
export const DataTable: React.FC<TableComponentProps> = ({
  dataKey,
  columns,
  fallback = 'No data available',
  showLoading = true,
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

  // Auto-generate columns from first item if not provided
  const getColumns = () => {
    if (columns && columns.length > 0) return columns;

    if (items.length === 0) return [];

    const firstItem = items[0];
    if (typeof firstItem !== 'object') return [{ key: 'value', label: 'Value' }];

    return Object.keys(firstItem).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  };

  const tableColumns = getColumns();

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
        <Table className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">
          Data Table ({items.length} rows)
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
        <div className="text-gray-500 italic p-4">No data to display</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {tableColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                  {tableColumns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm text-gray-700">
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-gray-500 italic p-4">{fallback}</div>
      )}
    </div>
  );
};
