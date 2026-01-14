import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { browserRouter } from './Router';
import { StoreProvider } from './store/StoreProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegrationsProvider } from './contexts/IntegrationsContext';
// Import i18n for side effects
import './i18n';
import './index.css';

/**
 * Initialize the TanStack Query client (dedupes & caches requests).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,               // 30-s default dedupe
      retry: 2,                        // auto-retry idempotent GETs
      refetchOnWindowFocus: false
    }
  }
});
/* Prefetch integrations once so first render never blocks */
const appLanguage = localStorage.getItem('appLanguage') || 'en';
queryClient.prefetchQuery({
  queryKey: ['integrations', appLanguage],
  queryFn: () => import('./services/integrationService').then(m => m.getLeanIntegrations())
});

// Render the app immediately since i18n is already initialized in i18n.ts
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <IntegrationsProvider>
        <StoreProvider>
          <RouterProvider router={browserRouter} />
        </StoreProvider>
      </IntegrationsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
