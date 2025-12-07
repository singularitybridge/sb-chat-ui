import { Users, Settings, Layers, Bot, FileText } from 'lucide-react';

export interface CommandGroup {
  id: string;
  label: string;
  icon: typeof Bot;
  enabled: boolean;
  description?: string;
}

export const commandGroups: CommandGroup[] = [
  {
    id: 'assistants',
    label: 'Assistants',
    icon: Bot,
    enabled: true,
    description: 'Search for AI assistants',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: FileText,
    enabled: true,
    description: 'Search workspace documents',
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: Layers,
    enabled: true,
    description: 'Search for teams',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    enabled: false,
    description: 'Search for users (coming soon)',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    enabled: false,
    description: 'Navigate to settings (coming soon)',
  },
];

export const getKeyboardShortcut = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? '⌘K' : 'Ctrl+K';
};
