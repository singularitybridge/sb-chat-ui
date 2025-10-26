import React from 'react';
import * as LucideIcons from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconcolor?: string;
  navigation?: NavItem[] | string; // Accept both array and JSON string
}

/**
 * Generic app header component for MDX pages
 * Features: icon, title, subtitle, and navigation tabs
 * Supports JSON string for navigation prop for HTML compatibility
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Application',
  subtitle = '',
  icon = 'LayoutDashboard',
  iconcolor = 'bg-blue-600',
  navigation = [],
}) => {
  // Get icon component from lucide-react
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.LayoutDashboard;

  // Parse navigation if it's a JSON string
  let navItems: NavItem[] = [];
  if (typeof navigation === 'string') {
    try {
      navItems = JSON.parse(navigation);
    } catch (e) {
      console.error('Failed to parse navigation JSON:', e);
    }
  } else if (Array.isArray(navigation)) {
    navItems = navigation;
  }

  return (
    <header className="not-prose bg-white border-b border-gray-200 sticky top-0 z-10 -mx-1 mb-8">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${iconcolor} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {navItems.length > 0 && (
            <nav className="flex gap-1">
              {navItems.map((item, index) => (
                <a
                  key={item.href || index}
                  onClick={(e) => {
                    e.preventDefault();

                    // Check if we're in an iframe
                    const isInIframe = window.self !== window.parent;

                    // @ts-ignore - global function
                    if (window.loadWorkspaceFile) {
                      // Use direct function call if available (same window context)
                      // @ts-ignore
                      window.loadWorkspaceFile(item.href);
                    } else if (isInIframe) {
                      // For iframe/embed context, use postMessage for cross-origin communication
                      // Use '*' as target origin - parent will verify the message origin
                      window.parent.postMessage({
                        type: 'navigate',
                        path: item.href
                      }, '*');
                    } else {
                      // Standalone mode - navigate directly via loadWorkspaceFile
                      // @ts-ignore
                      if (typeof window.loadWorkspaceFile === 'function') {
                        // @ts-ignore
                        window.loadWorkspaceFile(item.href);
                      } else {
                        // Fallback: manually trigger navigation by reloading with new path
                        const currentUrl = new URL(window.location.href);
                        const pathMatch = currentUrl.pathname.match(/\/embed\/workspace\/(.+)/);
                        if (pathMatch) {
                          // Create new document ID for the target path
                          const agentId = atob(pathMatch[1]).split(':')[0];
                          const newDocId = btoa(`${agentId}:${item.href}`);
                          window.location.href = `/embed/workspace/${newDocId}${currentUrl.search}`;
                        }
                      }
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                    item.active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
