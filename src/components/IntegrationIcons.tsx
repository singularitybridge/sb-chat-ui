import React, { useEffect, useState } from 'react';
import { getLeanIntegrations } from '../services/integrationService';
import Badge from './Badge';
import * as LucideIcons from 'lucide-react';

interface IntegrationIconsProps {
  integrations: string[];
  isActive?: boolean;
  className?: string;
}

interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const IntegrationIcons: React.FC<IntegrationIconsProps> = ({ integrations, isActive = false, className = '' }) => {
  const [integrationData, setIntegrationData] = useState<IntegrationInfo[]>([]);

  useEffect(() => {
    const fetchIntegrationData = async () => {
      try {
        const data = await getLeanIntegrations();
        setIntegrationData(data);
      } catch (error) {
        console.error('Error fetching integration data:', error);
      }
    };

    fetchIntegrationData();
  }, []);

  return (
    <div className={`flex flex-wrap gap-x-1 gap-y-1.5 ${className}`}>
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find(info => info.id.toLowerCase() === integration.toLowerCase());
        const iconName = integrationInfo?.icon || 'help-circle';
        const IconComponent = (LucideIcons as any)[iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')] || LucideIcons.HelpCircle;        

        return (
          <div key={integrationInfo?.name || index} title={integrationInfo?.description || ''}>
            <Badge
              variant={isActive ? 'primary' : 'secondary'}
              className={`flex items-center space-x-0.5 rtl:space-x-reverse ${isActive ? 'text-gray-500' : ''}`}
            >
              <IconComponent className={`w-3 h-3 mr-1 ${isActive ? 'text-gray-500' : ''}`} />
              <span>{(integrationInfo?.name || integration).toLowerCase()}</span>
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
