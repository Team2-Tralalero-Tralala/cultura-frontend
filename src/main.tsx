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
          <Route path="/filters" element={<HomePage />} />
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

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/Libs/AuthProvider";
import "./index.css"; // ต้องมี @tailwind base/components/utilities

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <BrowserRouter>

    <AuthProvider>
        <App />
    </AuthProvider>
      </BrowserRouter>

  </React.StrictMode>
);
