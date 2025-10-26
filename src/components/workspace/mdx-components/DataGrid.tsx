import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DataItem {
  label: string;
  value: string;
}

interface DataGridProps {
  title?: string;
  titleicon?: string;
  items?: DataItem[] | string; // Accept both array and JSON string
  columns?: number | string;
}

/**
 * Generic data grid component for MDX pages
 * Displays a grid of key-value pairs with labels and values
 * Supports JSON string for items prop for HTML compatibility
 */
export const DataGrid: React.FC<DataGridProps> = ({
  title = 'Data',
  titleicon = 'Database',
  items = [],
  columns = 2,
}) => {
  // Get title icon component
  const TitleIconComponent = (LucideIcons as any)[titleicon] || LucideIcons.Database;

  // Parse items if it's a JSON string
  let dataItems: DataItem[] = [];
  if (typeof items === 'string') {
    try {
      dataItems = JSON.parse(items);
    } catch (e) {
      console.error('Failed to parse items JSON:', e);
    }
  } else if (Array.isArray(items)) {
    dataItems = items;
  }

  // Parse columns if it's a string
  const colNum = typeof columns === 'string' ? parseInt(columns, 10) : columns;

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[colNum] || 'grid-cols-2';

  return (
    <div className="not-prose bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TitleIconComponent className="w-4 h-4" />
        {title}
      </h3>
      <div className={`grid ${gridColsClass} gap-4 text-sm`}>
        {dataItems.map((item, index) => (
          <div key={index}>
            <div className="text-gray-500 mb-1">{item.label}</div>
            <div className="font-mono text-xs text-gray-900 break-all">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
