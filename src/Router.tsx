import { Chat } from './pages/Chat';
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom'; 
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
import RequireAuth from './components/admin/RequireAuth';
import SignupPage from './pages/admin/SignupPage';
import OnboardingPage from './pages/admin/Onboarding';

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [

      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'onboarding', 
        element: <OnboardingPage />,
      },
      {
        index: true,
        element: <Navigate to="/signup" replace />, // Redirect to signup by default
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

