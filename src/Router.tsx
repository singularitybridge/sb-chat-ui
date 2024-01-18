import { Chat } from './pages/Chat';
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';
import React from 'react';
import {
  createBrowserRouter,
} from 'react-router-dom'; // Import the Outlet component
import App from './App';
import { ChatbotView } from './pages/admin/ChatbotView';
import { ChatRouteLoader } from './components/ChatRouteLoader';
import { AssistantsPage } from './pages/admin/AssistantsPage';
import { EditAssistantPage } from './pages/admin/EditAssistantPage';
import { CompaniesPage } from './pages/admin/CompaniesPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { InboxPage } from './pages/admin/InboxPage';
import { EditCompanyPage } from './pages/admin/EditCompanyPage';

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Chat />,
      },
      {
        path: '/chat/:sessionId',
        element: (
          <ChatRouteLoader>
            <Chat />
          </ChatRouteLoader>
        ),
      },
      {
        path: '/other',
        element: <Chat />,
      },
      {
        path: '/admin',
        element: <Admin />,
        children: [
          {
            index: true,
            element: <CompaniesPage />,
          },
          // {
          //   path: "/chat-sessions/:id",
          //   element: <ChatSessionView />,
          // },
          {
            path: 'chatbots/:key',
            element: <ChatbotView />,
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
