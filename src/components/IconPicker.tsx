import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

// Complete list of available Lucide icons
const AVAILABLE_ICONS = [
  'Activity', 'Airplay', 'AlertCircle', 'AlertTriangle', 'Archive', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
  'Award', 'BarChart', 'Battery', 'Bell', 'Bookmark', 'Box', 'Briefcase', 'Calendar', 'Camera', 'Check', 'CheckCircle',
  'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Circle', 'Clipboard', 'Clock', 'Cloud', 'Code', 'Coffee',
  'Command', 'Compass', 'Copy', 'CreditCard', 'Crown', 'Database', 'Delete', 'Download', 'Edit', 'Eye', 'EyeOff',
  'Facebook', 'File', 'FileText', 'Film', 'Filter', 'Flag', 'Folder', 'Gift', 'GitBranch', 'Github', 'Globe', 'Grid',
  'Hash', 'Heart', 'HelpCircle', 'Home', 'Image', 'Inbox', 'Info', 'Instagram', 'Key', 'Layers', 'Layout', 'Lightbulb',
  'Link', 'Linkedin', 'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Mail', 'Map', 'MapPin', 'Maximize', 'Menu',
  'MessageCircle', 'MessageSquare', 'Mic', 'Minimize', 'Monitor', 'Moon', 'Music', 'Navigation', 'Package', 'Palette',
  'Paperclip', 'Pause', 'Phone', 'PieChart', 'Play', 'Plus', 'PlusCircle', 'Power', 'Printer', 'Radio', 'RefreshCw',
  'Repeat', 'Rocket', 'Save', 'Search', 'Send', 'Server', 'Settings', 'Share', 'Shield', 'ShoppingCart', 'Shuffle',
  'Sidebar', 'Smartphone', 'Speaker', 'Square', 'Star', 'Sun', 'Tablet', 'Tag', 'Target', 'Terminal', 'ThumbsDown',
  'ThumbsUp', 'Tool', 'Trash', 'TrendingDown', 'TrendingUp', 'Triangle', 'Trophy', 'Truck', 'Twitter', 'Type', 'Umbrella',
  'Upload', 'User', 'UserCheck', 'UserMinus', 'UserPlus', 'Users', 'Video', 'Volume', 'Watch', 'Wifi', 'Wind', 'X',
  'XCircle', 'Youtube', 'Zap', 'ZoomIn', 'ZoomOut', 'Wrench'
];

/**
 * Icon picker component for selecting Lucide icons
 * Shows a grid of icons with search functionality
 */
export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) {
      return AVAILABLE_ICONS;
    }
    return AVAILABLE_ICONS.filter(icon =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Icon Grid */}
      <div className="overflow-y-auto bg-white" style={{ maxHeight: '240px' }}>
        {filteredIcons.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No icons found
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1 p-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              const isSelected = value === iconName;

              // Skip if icon component doesn't exist
              if (!IconComponent) return null;

              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  title={iconName}
                  className={`p-3 rounded-md transition-all hover:bg-gray-100 relative ${
                    isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`} />
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
