import { NotFound } from './pages/NotFound';
import HealthCheckPage from './pages/HealthCheckPage';
import { Admin } from './pages/Admin';
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { AssistantsPage } from './pages/admin/AssistantsPage';
import { EditAssistantPage } from './pages/admin/EditAssistantPage';
import { CompaniesPage } from './pages/admin/CompaniesPage';
import { CostsPage } from './pages/admin/CostsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { InboxPage } from './pages/admin/inbox/InboxPage';
import { EditCompanyPage } from './pages/admin/EditCompanyPage';
import { TeamsPage } from './pages/admin/TeamsPage';
import { EditTeamPage } from './pages/admin/EditTeamPage';
import { MemoryPage } from './pages/admin/MemoryPage'; // Added import for MemoryPage
import { ApiKeysPage } from './pages/admin/ApiKeysPage';
import { SignupPage } from './pages/SignupPage';
import { ChatKitTestPage } from './pages/test/ChatKitTestPage';
import { UIKitTestPage } from './pages/test/UIKitTestPage';
import JsonViewerTestPage from './pages/test/JsonViewerTestPage';
import { WorkspacePage } from './pages/admin/WorkspacePage';
import { WorkspaceJoinPage } from './pages/admin/WorkspaceJoinPage';
import WorkspaceAuthorizePage from './pages/admin/WorkspaceAuthorizePage';
import EmbedChatPage from './pages/embed/EmbedChatPage'; // Added import for EmbedChatPage
import EmbedWorkspacePage from './pages/embed/EmbedWorkspacePage'; // Added import for EmbedWorkspacePage
import { EmbedAuthProvider } from './contexts/EmbedAuthContext'; // Added import for EmbedAuthProvider
import ScreenShareWorkspace from './pages/ScreenShareWorkspace';

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/health',
        element: <HealthCheckPage />,
      },
      {
        path: 'embed/assistants/:id', // Added route for EmbedChatPage
        element: (
          <EmbedAuthProvider>
            <EmbedChatPage />
          </EmbedAuthProvider>
        ),
      },
      {
        path: 'embed/workspace/:documentId', // Added route for EmbedWorkspacePage (documentId = base64(assistantId:path))
        element: (
          <EmbedAuthProvider>
            <EmbedWorkspacePage />
          </EmbedAuthProvider>
        ),
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
            element: <Navigate to="/admin/assistants" replace />,
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
            path: 'assistants/:assistantName/workspace/*',
            element: <ScreenShareWorkspace />,
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
            path: 'costs',
            element: <CostsPage />,
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
          {
            path: 'api-keys',
            element: <ApiKeysPage />,
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
