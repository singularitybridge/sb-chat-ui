import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { browserRouter } from './Router';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { RootStore } from './store/models/RootStore';
import './i18n';
import './index.css';
import 'katex/dist/katex.min.css';
import './styles/katex.css';

// Initialize the root store
const rootStore = RootStore.create({});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootStoreProvider value={rootStore}>
      <RouterProvider router={browserRouter} />
    </RootStoreProvider>
  </React.StrictMode>
);
