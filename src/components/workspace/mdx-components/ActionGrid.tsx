import React from 'react';
import * as LucideIcons from 'lucide-react';

interface Action {
  icon: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

interface ActionGridProps {
  title?: string;
  titleicon?: string;
  actions?: Action[] | string; // Accept both array and JSON string
  columns?: number | string;
}

/**
 * Generic action grid component for MDX pages
 * Displays a grid of action cards with icons, titles, and descriptions
 */
export const ActionGrid: React.FC<ActionGridProps> = ({
  title = 'Quick Actions',
  titleicon = 'Zap',
  actions = [],
  columns = 3,
}) => {
  // Get title icon component
  const TitleIconComponent = (LucideIcons as any)[titleicon] || LucideIcons.Zap;

  // Parse actions if it's a JSON string
  let actionItems: Action[] = [];
  if (typeof actions === 'string') {
    try {
      actionItems = JSON.parse(actions);
    } catch (e) {
      console.error('Failed to parse actions JSON:', e);
    }
  } else if (Array.isArray(actions)) {
    actionItems = actions;
  }

  // Parse columns if it's a string
  const colNum = typeof columns === 'string' ? parseInt(columns, 10) : columns;

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[colNum] || 'grid-cols-3';

  return (
    <div className="not-prose bg-card p-4 rounded-lg border border-border mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <TitleIconComponent className="w-4 h-4" />
        {title}
      </h3>
      <div className={`grid ${gridColsClass} gap-3`}>
        {actionItems.map((action, index) => {
          const IconComponent = (LucideIcons as any)[action.icon] || LucideIcons.Circle;
          return (
            <a
              key={index}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-medium text-foreground">{action.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
};
