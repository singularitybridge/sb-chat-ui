import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import "./index.css";
import { browserRouter } from "./Router";
import { RouterProvider } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RecoilRoot>
    <RouterProvider router={browserRouter} />
  </RecoilRoot>
);
