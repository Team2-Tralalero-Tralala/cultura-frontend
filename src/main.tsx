/*import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./Page/HomePage";
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
