import React from 'react';
import { PhoneCall } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface VAPIHeaderProps {
  title?: string;
  subtitle?: string;
  navigation?: NavItem[];
}

/**
 * VAPI Integration Expert header component for MDX files
 * Matches the HTML header design with logo, title, and navigation
 */
export const VAPIHeader: React.FC<VAPIHeaderProps> = ({
  title = 'VAPI Integration Expert',
  subtitle = 'Voice AI Assistant',
  navigation = [
    { label: 'Home', href: '/vapi/app', active: true },
    { label: 'Tests', href: '/vapi/app/tests', active: false },
  ],
}) => {
  return (
    <header className="not-prose bg-background border-b border-border sticky top-0 z-10 -mx-1 mb-8">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  item.active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
