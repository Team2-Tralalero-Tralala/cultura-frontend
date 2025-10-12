import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./Page/HomePage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="font-sarabun">
      <BrowserRouter>
        <Routes>
          <Route path="/filters" element={<HomePage />} />
          {/* <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>
);
