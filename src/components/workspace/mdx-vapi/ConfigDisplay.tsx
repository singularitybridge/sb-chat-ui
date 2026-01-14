import React from 'react';
import { Settings } from 'lucide-react';

interface ConfigItem {
  label: string;
  value: string;
}

interface ConfigDisplayProps {
  title?: string;
  items?: ConfigItem[];
}

/**
 * Configuration display component for MDX files
 * Shows a 2-column grid of configuration key-value pairs
 */
export const ConfigDisplay: React.FC<ConfigDisplayProps> = ({
  title = 'Configuration',
  items = [
    { label: 'Assistant ID', value: '957955fc-dba8-4766-9132-4bcda7aad3b2' },
    { label: 'Agent ID', value: '68e1af59dd4ab3bce91a07dc' },
    { label: 'Tool Endpoint', value: 'http://localhost:4024' },
    { label: 'Webhook URL', value: 'https://193749846218.ngrok-free.app' },
  ],
}) => {
  return (
    <div className="not-prose bg-card p-4 rounded-lg border border-border mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {items.map((item, index) => (
          <div key={index}>
            <div className="text-muted-foreground mb-1">{item.label}</div>
            <div className="font-mono text-xs text-foreground break-all">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
