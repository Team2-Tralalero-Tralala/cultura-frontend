/*import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./Libs/AuthProvider";
import App from "./App";

import "./index.css";
//import { BrowserRouter, Route, Routes } from "react-router";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="font-sarabun">
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          {/* <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> }
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>
);
*/


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
