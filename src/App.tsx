import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PriceDemo from "./pages/PriceDemo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PriceDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
