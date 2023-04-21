import { Chat } from "./pages/Chat";
import { NotFound } from "./pages/NotFound";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";

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
      { path: "*", element: <NotFound /> },
    ],
  },
]);
