import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { browserRouter } from './Router';
import { StoreProvider } from './store/StoreProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegrationsProvider } from './contexts/IntegrationsContext';
import { ClerkProvider } from '@clerk/clerk-react';
// Import i18n for side effects
import './i18n';
import './index.css';

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

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
/* Prefetch integrations once so first render never blocks (only when authenticated) */
const appLanguage = localStorage.getItem('appLanguage') || 'en';
const userToken = localStorage.getItem('userToken');
if (userToken) {
  queryClient.prefetchQuery({
    queryKey: ['integrations', appLanguage],
    queryFn: () => import('./services/integrationService').then(m => m.getLeanIntegrations())
  });
}

// Render the app immediately since i18n is already initialized in i18n.ts
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <IntegrationsProvider>
          <StoreProvider>
            <RouterProvider router={browserRouter} />
          </StoreProvider>
        </IntegrationsProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
