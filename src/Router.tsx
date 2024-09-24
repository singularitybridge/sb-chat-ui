/// file_path: src/Router.tsx
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { AssistantsPage } from './pages/admin/AssistantsPage';
import { EditAssistantPage } from './pages/admin/EditAssistantPage';
import { CompaniesPage } from './pages/admin/CompaniesPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { InboxPage } from './pages/admin/inbox/InboxPage';
import { EditCompanyPage } from './pages/admin/EditCompanyPage';
import { SignupPage } from './pages/SignupPage';
import { ChatKitTestPage } from './pages/test/ChatKitTestPage';
import { UIKitTestPage } from './pages/test/UIKitTestPage';

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        index: true,
        element: <Navigate to="/admin/assistants" replace />,
      },
      {
        path: 'test/chat',
        element: <ChatKitTestPage />,
      },
      {
        path: 'test/ui',
        element: <UIKitTestPage />,
      },
      {
        path: '/admin',
        element: <Admin />,
        children: [
          {
            index: true,
            element: <CompaniesPage />,
          },
          {
            path: 'assistants',
            element: <AssistantsPage />,
          },
          {
            path: 'assistants/:key',
            element: <EditAssistantPage />,
          },
          {
            path: 'companies',
            element: <CompaniesPage />,
          },
          {
            path: 'companies/:id',
            element: <EditCompanyPage />,
          },
          {
            path: 'sessions',
            element: <SessionsPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'inbox',
            element: <InboxPage />,
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);