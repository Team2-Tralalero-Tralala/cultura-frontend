import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfileForm from "./pages/ProfileForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/profile/edit" />} />
        <Route path="/profile/edit" element={<ProfileForm />} />
      </Routes>
    </BrowserRouter>
  );
}


