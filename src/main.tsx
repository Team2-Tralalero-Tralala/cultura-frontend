import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Libs/AuthProvider";
import App from "./App";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ต้อง import CSS ด้วย
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="font-sarabun">
      <BrowserRouter>
        <AuthProvider>
          <App />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  </StrictMode>
);
