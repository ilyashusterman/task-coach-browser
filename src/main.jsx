// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ModelProvider } from "./contexts/ModelContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ModelProvider>
      <App />
    </ModelProvider>
  </React.StrictMode>
);
