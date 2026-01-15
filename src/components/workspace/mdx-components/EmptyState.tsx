import React from 'react';
import * as LucideIcons from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
}

/**
 * Generic empty state component for MDX pages
 * Displays an icon with a message and description
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'Inbox',
  title = 'No items found',
  description = 'There are no items to display',
}) => {
  // Get icon component from lucide-react
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Inbox;

  return (
    <div className="not-prose bg-card p-8 rounded-lg border border-border text-center mb-6">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
        <IconComponent className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};
