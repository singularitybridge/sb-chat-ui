import React from 'react';
import * as LucideIcons from 'lucide-react';

interface ActionButton {
  icon: string;
  label: string;
  variant?: 'primary' | 'secondary'; // primary = blue, secondary = gray
}

interface ActionBarProps {
  actions?: ActionButton[] | string; // Accept both array and JSON string
  statustext?: string; // Optional status text on the right
}

/**
 * Action bar component for displaying action buttons in a single row
 * Perfect for "Run All" / "Clear" type actions at the top of dashboards
 */
export const ActionBar: React.FC<ActionBarProps> = ({
  actions = [],
  statustext = '',
}) => {
  // Parse actions if it's a JSON string
  let actionItems: ActionButton[] = [];
  if (typeof actions === 'string') {
    try {
      actionItems = JSON.parse(actions);
    } catch (e) {
      console.error('Failed to parse actions JSON:', e);
    }
  } else if (Array.isArray(actions)) {
    actionItems = actions;
  }

  return (
    <div className="not-prose bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {actionItems.map((action, index) => {
            const IconComponent = (LucideIcons as any)[action.icon] || LucideIcons.Circle;
            const isPrimary = action.variant === 'primary' || index === 0; // First button is primary by default

            const buttonClass = isPrimary
              ? 'px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
              : 'px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2';

            return (
              <button key={index} className={buttonClass}>
                <IconComponent className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
        {statustext && (
          <div className="text-sm text-gray-500">
            {statustext}
          </div>
        )}
      </div>
    </div>
  );
};
