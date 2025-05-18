import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { browserRouter } from './Router';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { RootStore } from './store/models/RootStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegrationsProvider } from './contexts/IntegrationsContext';
// Import i18n for side effects
import './i18n';
import './index.css';

/**
 * Initialize the TanStack Query client (dedupes & caches requests)
 * and the global RootStore.
 */
const queryClient = new QueryClient();
const rootStore = RootStore.create({
  language: localStorage.getItem('appLanguage') || 'he'
});

// Render the app immediately since i18n is already initialized in i18n.ts
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <IntegrationsProvider>
      <RootStoreProvider value={rootStore}>
        <RouterProvider router={browserRouter} />
      </RootStoreProvider>
    </IntegrationsProvider>
  </QueryClientProvider>
  </React.StrictMode>
);
