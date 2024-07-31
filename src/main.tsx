import React from 'react';
import ReactDOM from 'react-dom/client';
import 'regenerator-runtime/runtime';
import './index.css';
import './i18n';
import { browserRouter } from './Router';
import { RouterProvider } from 'react-router-dom';
import { getInitialLanguage } from './i18n';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { RootStore } from './store/models/RootStore';


const initialLanguage = getInitialLanguage();

const rootStore = RootStore.create({
  authStore: {
    isAuthenticated: false,
  },
  assistants: [],
  users: [],
  language: initialLanguage,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootStoreProvider value={rootStore}>
    <RouterProvider router={browserRouter} />
  </RootStoreProvider>
);
