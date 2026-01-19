import React, { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getLeanIntegrations, clearIntegrationCache, IntegrationInfo } from '../services/integrationService';

type IntegrationsQuery = UseQueryResult<IntegrationInfo[], Error> | undefined;

const IntegrationsCtx = createContext<IntegrationsQuery>(undefined);

export const IntegrationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // Include language in query key so cache is invalidated on language change
  const language = localStorage.getItem('appLanguage') || 'en';
  // Only fetch integrations when user is authenticated
  const isAuthenticated = !!localStorage.getItem('userToken');

  const integrationsQuery = useQuery<IntegrationInfo[], Error>({
    queryKey: ['integrations', language],
    queryFn: () => {
      // Clear module-level cache to ensure fresh fetch with new language
      clearIntegrationCache();
      return getLeanIntegrations();
    },
    staleTime: 10 * 60_000, // 10-min cache
    enabled: isAuthenticated // Only run when user is logged in
  });

  return (
    <IntegrationsCtx.Provider value={integrationsQuery}>
      {children}
    </IntegrationsCtx.Provider>
  );
};

export const useIntegrations = () => {
  const ctx = useContext(IntegrationsCtx);
  // Return undefined if not within provider or not authenticated
  // Components using this hook should handle the undefined case
  return ctx;
};
