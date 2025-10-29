// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="font-sarabun">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </StrictMode>
);