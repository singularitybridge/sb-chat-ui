// Router.tsx
import { Chat } from "./pages/Chat";
import { NotFound } from "./pages/NotFound";
import { Admin } from "./pages/Admin"; // Import the Admin component

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { ChatSessionView } from "./services/ChatSessionView";

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
        path: "/admin", // Add a new route for the admin page
        element: <Admin />,
      },
      {
        path: "/admin/chat-sessions/:id",
        element: <ChatSessionView />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
