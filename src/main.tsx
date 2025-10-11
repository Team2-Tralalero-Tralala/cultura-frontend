/**
 * Entry ของฝั่ง Client
 * - ครอบด้วย BrowserRouter
 * - ตั้งค่า global font
 */

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <div className="font-sarabun">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </div>
);
