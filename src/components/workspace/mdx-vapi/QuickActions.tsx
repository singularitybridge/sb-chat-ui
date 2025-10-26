import React from 'react';
import { FlaskConical, LayoutDashboard, Phone, LucideIcon } from 'lucide-react';

interface Action {
  icon: string; // Icon name from lucide-react
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

interface QuickActionsProps {
  actions?: Action[];
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  flask: FlaskConical,
  'flask-conical': FlaskConical,
  'layout-dashboard': LayoutDashboard,
  phone: Phone,
};

/**
 * Quick actions grid component for MDX files
 * Displays a 3-column grid of action cards with hover effects
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = [
    {
      icon: 'flask',
      title: 'Run Tests',
      description: 'Test integration expert',
      href: '/vapi/app/tests',
    },
    {
      icon: 'layout-dashboard',
      title: 'Agent Hub',
      description: 'Manage agents',
      href: 'http://localhost:3000',
      external: true,
    },
    {
      icon: 'phone',
      title: 'VAPI Dashboard',
      description: 'Manage voice assistant',
      href: 'https://dashboard.vapi.ai',
      external: true,
    },
  ],
}) => {
  return (
    <div className="not-prose bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const IconComponent = iconMap[action.icon] || FlaskConical;
          return (
            <a
              key={index}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                <span className="text-sm font-medium text-gray-900">{action.title}</span>
              </div>
              <p className="text-xs text-gray-500">{action.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
};
