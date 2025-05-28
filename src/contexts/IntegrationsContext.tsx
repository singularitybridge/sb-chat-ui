import React, { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getLeanIntegrations, IntegrationInfo } from '../services/integrationService';

type IntegrationsQuery = UseQueryResult<IntegrationInfo[], Error> | undefined;

const IntegrationsCtx = createContext<IntegrationsQuery>(undefined);

export const IntegrationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const integrationsQuery = useQuery<IntegrationInfo[], Error>({
    queryKey: ['integrations'],
    queryFn: getLeanIntegrations,
    staleTime: 10 * 60_000 // 10-min cache
  });

  return (
    <IntegrationsCtx.Provider value={integrationsQuery}>
      {children}
    </IntegrationsCtx.Provider>
  );
};

export const useIntegrations = () => {
  const ctx = useContext(IntegrationsCtx);
  if (!ctx) {
    throw new Error('useIntegrations must be used within IntegrationsProvider');
  }
  return ctx;
};
