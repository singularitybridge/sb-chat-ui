import React, { useEffect, useState } from 'react';
import apiClient from '../services/AxiosService';
import Badge from './Badge';
import * as LucideIcons from 'lucide-react';

interface IntegrationIconsProps {
  integrations: string[];
}

interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const mapIconName = (iconName: string): keyof typeof LucideIcons => {
  const pascalCase = iconName.split(/[-_\s]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  
  const specialCases: { [key: string]: keyof typeof LucideIcons } = {
    'image': 'Image',
    'brain': 'Brain',
    // Add more special cases here if needed
  };

  return (specialCases[iconName] || pascalCase) as keyof typeof LucideIcons;
};

const IntegrationIcons: React.FC<IntegrationIconsProps> = ({ integrations }) => {
  const [integrationData, setIntegrationData] = useState<IntegrationInfo[]>([]);

  useEffect(() => {
    const fetchIntegrationData = async () => {
      try {
        const response = await apiClient.get('/integrations/discover/lean?fields=id,name,description,icon');
        setIntegrationData(response.data);
      } catch (error) {
        console.error('Error fetching integration data:', error);
      }
    };

    fetchIntegrationData();
  }, []);

  return (
    <div className="flex flex-wrap gap-x-0.5 gap-y-1">
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find(info => info.name.toLowerCase() === integration.toLowerCase());
        const mappedIconName = mapIconName(integrationInfo?.icon || 'HelpCircle');
        const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

        return (
          <div key={integrationInfo?.name || index} title={integrationInfo?.description || ''}>
            <Badge
              variant="secondary"
              className="flex items-center space-x-0.5 rtl:space-x-reverse"
            >
              <IconComponent className="w-3 h-3 mr-1" />
              <span>{(integrationInfo?.name || integration).toLowerCase()}</span>
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
