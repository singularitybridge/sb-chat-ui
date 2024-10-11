import React, { useEffect, useState } from 'react';
import apiClient from '../services/AxiosService';
import Badge from './Badge';

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

  return (
    <div className="flex flex-wrap gap-x-0.5 gap-y-1">
      {integrations.map((integration, index) => {
        const integrationInfo = integrationData.find(info => info.name.toLowerCase() === integration.toLowerCase());
        return (
          <div key={integrationInfo?.name || index} title={integrationInfo?.description || ''}>
            <Badge
              variant="secondary"
              className="text-xs"
            >
              {(integrationInfo?.name || integration).toLowerCase()}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationIcons;
