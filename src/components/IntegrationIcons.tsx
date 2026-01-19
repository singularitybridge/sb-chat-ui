import React from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { Badge } from './ui/badge';
import * as LucideIcons from 'lucide-react';

interface IntegrationIconsProps {
  integrations: string[];
  isActive?: boolean;
  className?: string;
}

const IntegrationIcons: React.FC<IntegrationIconsProps> = ({
  integrations,
  isActive = false,
  className = ''
}) => {
  // Access cached integrations from context/query (may be undefined if not authenticated)
  const integrationsQuery = useIntegrations();
  const integrationData = integrationsQuery?.data ?? [];

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find((info) => info.id.toLowerCase() === integration.toLowerCase());
        const iconName = integrationInfo?.icon || 'help-circle';
        const IconComponent = (LucideIcons as any)[iconName.split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join('')] || LucideIcons.HelpCircle;

        return (
          <Badge
            key={integrationInfo?.name || index}
            variant={isActive ? 'info' : 'secondary'}
            title={integrationInfo?.description || ''}
          >
            <IconComponent className="w-3 h-3" />
            <span>{(integrationInfo?.name || integration).toLowerCase()}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
