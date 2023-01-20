import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Modal from "react-modal";
import { Auth0Provider } from "@auth0/auth0-react";

Modal.setAppElement("#root");

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Auth0Provider
    domain="dev-7gvrq56iomebax8m.us.auth0.com"
    clientId="rcHr9i7LUpbytsybNlRrrk14mTUAadDt"
    redirectUri={`${window.location.origin}/components/blocks/Features/VerticalWithAlternateImageAndText`}
  >
    <App />
  </Auth0Provider>
);
