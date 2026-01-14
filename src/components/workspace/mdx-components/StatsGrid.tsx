import React from 'react';
import * as LucideIcons from 'lucide-react';

interface StatItem {
  icon: string;
  label: string;
  value: string | number;
  color?: string; // Icon/value color class (e.g., "text-green-600")
  bgcolor?: string; // Background color class (e.g., "bg-green-100")
}

interface StatsGridProps {
  stats?: StatItem[] | string; // Accept both array and JSON string
  columns?: number | string;
}

/**
 * Statistics grid component for displaying metric cards with icons and large values
 * Perfect for dashboards showing counts, totals, and status metrics
 */
export const StatsGrid: React.FC<StatsGridProps> = ({
  stats = [],
  columns = 4,
}) => {
  // Parse stats if it's a JSON string
  let statItems: StatItem[] = [];
  if (typeof stats === 'string') {
    try {
      statItems = JSON.parse(stats);
    } catch (e) {
      console.error('Failed to parse stats JSON:', e);
    }
  } else if (Array.isArray(stats)) {
    statItems = stats;
  }

  // Parse columns if it's a string
  const colNum = typeof columns === 'string' ? parseInt(columns, 10) : columns;

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[colNum] || 'grid-cols-4';

  return (
    <div className={`not-prose grid ${gridColsClass} gap-4 mb-6`}>
      {statItems.map((stat, index) => {
        const IconComponent = (LucideIcons as any)[stat.icon] || LucideIcons.Circle;
        const iconColor = stat.color || 'text-muted-foreground';
        const bgColor = stat.bgcolor || 'bg-secondary';

        return (
          <div key={index} className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className={`text-2xl font-semibold ${stat.color || 'text-foreground'}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
