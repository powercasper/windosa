import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MetadataProvider } from "./contexts/MetadataContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MetadataProvider>
    <App />
  </MetadataProvider>
);
