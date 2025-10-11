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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          {/* <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> }
        </Routes>
      </BrowserRouter>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </div>
  </StrictMode>
);
*/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
//import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx"; // ใช้ App component

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App /> {/* ใช้ App แทน SidebarForSuperAdmin */}
    </BrowserRouter>
  </StrictMode>
);