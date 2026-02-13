import React from 'react';
import {
  SiOpenai,
  SiJira,
  SiLinear,
  SiMongodb,
  SiAmazonwebservices,
} from 'react-icons/si';
import { Icon } from '@iconify/react';
import {
  Brain,
  AudioWaveform,
  Search,
  Mail,
  Cpu,
  Image,
  Hotel,
  Database,
  SquareTerminal,
  FileText,
  MessageSquare,
  Monitor,
  Eye,
  Folder,
  Bot,
  Bug,
  BookOpen,
  Inbox,
  Zap,
  Sparkles,
  Code,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface IntegrationIconProps {
  integrationName: string;
  icon?: string;
  size?: IconSize;
  className?: string;
  showBackground?: boolean;
}

const sizeClasses: Record<IconSize, { container: string; icon: string; iconPx: number }> = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', iconPx: 16 },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5', iconPx: 20 },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6', iconPx: 24 },
  xl: { container: 'w-16 h-16', icon: 'w-8 h-8', iconPx: 32 },
};

// Brand icons using Simple Icons from react-icons
const brandIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: SiOpenai,
  jira: SiJira,
  linear: SiLinear,
  mongodb: SiMongodb,
  aws: SiAmazonwebservices,
};

// Iconify icon names for services (Simple Icons)
const iconifyIcons: Record<string, string> = {
  elevenlabs: 'simple-icons:elevenlabs',
  perplexity: 'simple-icons:perplexity',
  nylas: 'simple-icons:gmail', // Nylas is email, use Gmail as fallback
  anthropic: 'simple-icons:anthropic',
  gemini: 'simple-icons:googlegemini',
  fly: 'simple-icons:flydotio',
  sendgrid: 'simple-icons:sendgrid',
  replicate: 'simple-icons:replicate',
};

// Lucide icons for generic purposes
const lucideIcons: Record<string, LucideIcon> = {
  brain: Brain,
  'audio-waveform': AudioWaveform,
  search: Search,
  mail: Mail,
  cpu: Cpu,
  image: Image,
  hotel: Hotel,
  database: Database,
  'square-terminal': SquareTerminal,
  file: FileText,
  'message-square': MessageSquare,
  monitor: Monitor,
  eye: Eye,
  folder: Folder,
  bot: Bot,
  bug: Bug,
  book: BookOpen,
  inbox: Inbox,
  zap: Zap,
  sparkles: Sparkles,
  code: Code,
};

// Map integration names to their preferred icon type
const integrationIconMap: Record<string, { type: 'brand' | 'iconify' | 'lucide'; key: string }> = {
  // Brand integrations (react-icons/si)
  openai: { type: 'brand', key: 'openai' },
  jira: { type: 'brand', key: 'jira' },
  linear: { type: 'brand', key: 'linear' },
  mongodb: { type: 'brand', key: 'mongodb' },
  aws_bedrock_kb: { type: 'brand', key: 'aws' },

  // Iconify integrations (Simple Icons via Iconify)
  elevenlabs: { type: 'iconify', key: 'elevenlabs' },
  perplexity: { type: 'iconify', key: 'perplexity' },
  anthropic: { type: 'iconify', key: 'anthropic' },
  gemini: { type: 'iconify', key: 'gemini' },
  fly: { type: 'iconify', key: 'fly' },
  sendgrid: { type: 'iconify', key: 'sendgrid' },
  replicate: { type: 'iconify', key: 'replicate' },

  // Lucide integrations
  nylas: { type: 'lucide', key: 'mail' },
  photoroom: { type: 'lucide', key: 'image' },
  fluximage: { type: 'lucide', key: 'sparkles' },
  roomboss: { type: 'lucide', key: 'hotel' },
  curl: { type: 'lucide', key: 'square-terminal' },
  golem: { type: 'lucide', key: 'code' },
  file_processing: { type: 'lucide', key: 'file' },
  session_query: { type: 'lucide', key: 'message-square' },
  ui_control: { type: 'lucide', key: 'monitor' },
  ui_state: { type: 'lucide', key: 'eye' },
  unified_workspace: { type: 'lucide', key: 'folder' },
  assistant: { type: 'lucide', key: 'bot' },
  debug: { type: 'lucide', key: 'bug' },
  journal: { type: 'lucide', key: 'book' },
  inbox: { type: 'lucide', key: 'inbox' },
  ai_context_service: { type: 'lucide', key: 'brain' },
  agent_hub_ui_context: { type: 'lucide', key: 'monitor' },
};

// Brand-specific colors for visual distinction
const brandColors: Record<string, string> = {
  openai: 'text-[#412991]',
  jira: 'text-[#0052CC]',
  linear: 'text-[#5E6AD2]',
  mongodb: 'text-[#47A248]',
  sendgrid: 'text-[#1A82E2]', // SendGrid blue
  aws: 'text-[#FF9900]',
  elevenlabs: 'text-foreground',
  perplexity: 'text-[#20808d]',
  anthropic: 'text-[#D4A27F]', // Anthropic brand color (warm tan/beige)
  gemini: 'text-[#8E75B2]', // Google Gemini purple
  fly: 'text-[#8B5CF6]', // Fly.io purple
  replicate: 'text-foreground', // Replicate black
};

export const IntegrationIcon: React.FC<IntegrationIconProps> = ({
  integrationName,
  icon,
  size = 'md',
  className,
  showBackground = true,
}) => {
  const { container, icon: iconSize, iconPx } = sizeClasses[size];

  const renderIcon = () => {
    const normalizedName = integrationName.toLowerCase();

    // Check if we have a specific mapping for this integration
    const mapping = integrationIconMap[normalizedName];

    if (mapping) {
      if (mapping.type === 'brand') {
        const BrandIcon = brandIcons[mapping.key];
        if (BrandIcon) {
          const colorClass = brandColors[mapping.key] || 'text-foreground';
          return <BrandIcon className={cn(iconSize, colorClass)} />;
        }
      } else if (mapping.type === 'iconify') {
        const iconName = iconifyIcons[mapping.key];
        if (iconName) {
          const colorClass = brandColors[mapping.key] || 'text-foreground';
          return (
            <Icon
              icon={iconName}
              width={iconPx}
              height={iconPx}
              className={colorClass}
            />
          );
        }
      } else {
        const LucideIcon = lucideIcons[mapping.key];
        if (LucideIcon) {
          return <LucideIcon className={cn(iconSize, 'text-foreground')} />;
        }
      }
    }

    // Try to use the icon prop if provided
    if (icon) {
      // Check brand icons first
      if (brandIcons[icon]) {
        const BrandIcon = brandIcons[icon];
        const colorClass = brandColors[icon] || 'text-foreground';
        return <BrandIcon className={cn(iconSize, colorClass)} />;
      }

      // Check Lucide icons
      if (lucideIcons[icon]) {
        const LucideIcon = lucideIcons[icon];
        return <LucideIcon className={cn(iconSize, 'text-foreground')} />;
      }
    }

    // Fallback to first letter
    const fontSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-xl';
    return (
      <span className={cn('font-semibold text-foreground', fontSize)}>
        {integrationName.charAt(0).toUpperCase()}
      </span>
    );
  };

  if (!showBackground) {
    return <div className={cn('flex items-center justify-center', className)}>{renderIcon()}</div>;
  }

  return (
    <div
      className={cn(
        'shrink-0 rounded-lg bg-accent flex items-center justify-center',
        container,
        className
      )}
    >
      {renderIcon()}
    </div>
  );
};
