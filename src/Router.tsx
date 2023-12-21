import { Chat } from "./pages/Chat";
import { NotFound } from "./pages/NotFound";
import { Admin } from "./pages/Admin";
import React, { ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
} from "react-router-dom"; // Import the Outlet component
import App from "./App";
import { ChatSessionView } from "./services/ChatSessionView";
import { Dashboard } from "./pages/admin/Dashboard";
import { ChatbotView } from "./pages/admin/ChatbotView";
import { useRootStore } from "./store/common/RootStoreContext";
import { autorun } from "mobx";
import { ChatRouteLoader } from "./components/ChatRouteLoader";
import { AssistantsView } from "./pages/admin/AssistantsView";
import { EditAssistantsView } from "./pages/admin/EditAssistantView";

export const browserRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Chat />,
      },
      {
        path: "/chat/:sessionId",
        element: (
          <ChatRouteLoader>
            <Chat />
          </ChatRouteLoader>
        ),
      },
      {
        path: "/other",
        element: <Chat />,
      },
      {
        path: "/admin",
        element: <Admin />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          // {
          //   path: "/chat-sessions/:id",
          //   element: <ChatSessionView />,
          // },
          {
            path: "chatbots/:key",
            element: <ChatbotView />,
          },
          {
            path: "assistants",
            element: <AssistantsView />,
          },
          {
            path: "assistants/:key",
            element: <EditAssistantsView />,
          }
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
