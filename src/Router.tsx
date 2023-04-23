import { Chat } from "./pages/Chat";
import { NotFound } from "./pages/NotFound";
import { Admin } from "./pages/Admin";
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; // Import the Outlet component
import App from "./App";
import { ChatSessionView } from "./services/ChatSessionView";
import { Dashboard } from "./pages/admin/Dashboard";
import { ChatbotView } from "./pages/admin/ChatbotView";

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
        element: <Chat />,
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
            element: <Dashboard />
          },
          // {
          //   path: "/chat-sessions/:id",
          //   element: <ChatSessionView />,
          // },
          {
            path: "chatbots/:key",
            element: <ChatbotView />,
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
