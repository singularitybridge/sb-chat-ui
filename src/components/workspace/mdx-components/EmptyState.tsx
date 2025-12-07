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
    <div className="not-prose bg-white p-8 rounded-lg border border-gray-200 text-center mb-6">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <IconComponent className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};
