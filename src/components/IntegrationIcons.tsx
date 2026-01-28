import React from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { Badge } from './ui/badge';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationIconsProps {
  integrations: string[];
  isActive?: boolean;
  className?: string;
  size?: 'small' | 'default';
}

const IntegrationIcons: React.FC<IntegrationIconsProps> = ({
  integrations,
  isActive = false,
  className = '',
  size = 'default'
}) => {
  const integrationsQuery = useIntegrations();
  const integrationData = integrationsQuery?.data ?? [];

  // Aligned with ModelIndicator sizing
  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize = size === 'small' ? 'text-[11px]' : 'text-xs';
  const gapSize = size === 'small' ? 'gap-1' : 'gap-1.5';
  const badgeHeight = size === 'small' ? 'h-5' : 'h-6';
  const badgePx = size === 'small' ? 'px-2' : 'px-2.5';

  return (
    <div className={cn('flex flex-wrap', gapSize, className)}>
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find((info) => info.id.toLowerCase() === integration.toLowerCase());
        const iconName = integrationInfo?.icon || 'help-circle';
        const IconComponent = (LucideIcons as any)[iconName.split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join('')] || LucideIcons.HelpCircle;

        return (
          <Badge
            key={integrationInfo?.name || index}
            variant="secondary"
            title={integrationInfo?.description || ''}
            className={cn(
              'gap-1 font-medium font-inter rounded-full',
              badgeHeight,
              badgePx,
              textSize,
              // Distinct color from ModelIndicator (which uses neutral gray)
              isActive
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'bg-primary/10 text-primary/80 border border-primary/10'
            )}
          >
            <IconComponent className={iconSize} />
            <span className="capitalize">{(integrationInfo?.name || integration).toLowerCase()}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
