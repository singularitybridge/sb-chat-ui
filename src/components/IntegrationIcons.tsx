import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import apiClient from '../services/AxiosService';

interface IntegrationIconsProps {
  integrations: string[];
}

interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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

  const mapIconName = (iconName: string): keyof typeof LucideIcons => {
    const pascalCase = iconName.split(/[-_\s]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
    return (pascalCase in LucideIcons ? pascalCase : 'HelpCircle') as keyof typeof LucideIcons;
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find(info => info.id === integration);
        const iconName = integrationInfo ? mapIconName(integrationInfo.icon) : 'HelpCircle';
        const IconComponent = LucideIcons[iconName] as React.ComponentType<React.SVGProps<SVGSVGElement>>;

        return (
          <div key={index} className="w-6 h-6 flex items-center justify-center" title={integrationInfo?.name || integration}>
            <IconComponent className="w-5 h-5 text-gray-600" />
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
