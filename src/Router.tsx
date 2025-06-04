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
import { TeamsPage } from './pages/admin/TeamsPage';
import { EditTeamPage } from './pages/admin/EditTeamPage';
import { MemoryPage } from './pages/admin/MemoryPage'; // Added import for MemoryPage
import { SignupPage } from './pages/SignupPage';
import { ChatKitTestPage } from './pages/test/ChatKitTestPage';
import { UIKitTestPage } from './pages/test/UIKitTestPage';
import JsonViewerTestPage from './pages/test/JsonViewerTestPage';
import { WorkspacePage } from './pages/admin/WorkspacePage';
import { WorkspaceJoinPage } from './pages/admin/WorkspaceJoinPage';
import WorkspaceAuthorizePage from './pages/admin/WorkspaceAuthorizePage';
import EmbedChatPage from './pages/embed/EmbedChatPage'; // Added import for EmbedChatPage

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: 'embed/assistants/:id', // Added route for EmbedChatPage
        element: <EmbedChatPage />,
      },
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
        path: 'test/json-viewer',
        element: <JsonViewerTestPage />,
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
            path: 'assistants/team/:teamId',
            element: <AssistantsPage />,
          },
          {
            path: 'assistants/workspace/join',
            element: <WorkspaceJoinPage />,
          },
          {
            path: 'assistants/workspace/authorize-app',
            element: <WorkspaceAuthorizePage />,
          },
          {
            path: 'assistants/workspace/:artifactId',
            element: <WorkspacePage />,
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
            path: 'teams',
            element: <TeamsPage />,
          },
          {
            path: 'teams/:key',
            element: <EditTeamPage />,
          },
          {
            path: 'memory', // Added route for MemoryPage
            element: <MemoryPage />,
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
