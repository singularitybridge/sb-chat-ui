import React from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { Badge } from './ui/badge';
import * as LucideIcons from 'lucide-react';

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
  // Access cached integrations from context/query (may be undefined if not authenticated)
  const integrationsQuery = useIntegrations();
  const integrationData = integrationsQuery?.data ?? [];

  const iconSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const textSize = size === 'small' ? 'text-[10px]' : '';
  const gapSize = size === 'small' ? 'gap-1' : 'gap-1.5';
  const badgePadding = size === 'small' ? 'px-1.5 py-0' : '';

  return (
    <div className={`flex flex-wrap ${gapSize} ${className}`}>
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find((info) => info.id.toLowerCase() === integration.toLowerCase());
        const iconName = integrationInfo?.icon || 'help-circle';
        const IconComponent = (LucideIcons as any)[iconName.split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join('')] || LucideIcons.HelpCircle;

        return (
          <Badge
            key={integrationInfo?.name || index}
            variant={isActive ? 'info' : 'secondary'}
            title={integrationInfo?.description || ''}
            className={`${badgePadding} ${textSize} ${!isActive ? 'bg-muted-foreground/15' : ''}`}
          >
            <IconComponent className={iconSize} />
            <span>{(integrationInfo?.name || integration).toLowerCase()}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
