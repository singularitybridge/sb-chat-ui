import { Chat } from './pages/Chat';
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom'; // Import the Outlet component
import App from './App';
import { ChatbotView } from './pages/admin/ChatbotView';
import { ChatRouteLoader } from './components/ChatRouteLoader';
import { AssistantsPage } from './pages/admin/AssistantsPage';
import { EditAssistantPage } from './pages/admin/EditAssistantPage';
import { CompaniesPage } from './pages/admin/CompaniesPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { InboxPage } from './pages/admin/inbox/InboxPage';
import { EditCompanyPage } from './pages/admin/EditCompanyPage';
import { ActionsPage } from './pages/admin/ActionsPage';
import { EditActionPage } from './pages/admin/EditActionPage';
import LoginPage from './pages/admin/LoginPage';
import RequireAuth from './components/admin/RequireAuth';

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [

      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        index: true,
        element: <Navigate to="/login" replace />, // Redirect to login by default
      },
      {
        path: '/chat',
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
        element:
          <RequireAuth><Admin /></RequireAuth>,
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
            path: 'actions',
            element: <ActionsPage />,
          },
          {
            path: 'actions/:id',
            element: <EditActionPage />,

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

