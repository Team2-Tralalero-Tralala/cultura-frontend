import { Route, Routes, Navigate } from "react-router";
// import ProtectedRoute from "./Libs/ProtectedRoute";
import RoleRedirect from "./Libs/RoleRedirect";

import LoginAdmin from "./Pages/LoginAdmin.tsx";
import Register from "./Pages/Register.tsx";
import ForgotPassword from "./Pages/ForgotPassword.tsx";
import LoginTourist from "./Pages/LoginTourist.tsx";

function App() {
  return (
    <>
      <Routes>
        {/* public */}
        <Route path="/login" element={<LoginTourist />} />
        <Route path="admin/login" element={<LoginAdmin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* root -> เด้งตาม role */}
        <Route index element={<RoleRedirect />} />

        {/* private routes */}
        {/* <Route
          element={<ProtectedRoute allow={["member", "admin", "superadmin"]} />}
        >
          <Route path="/admin/home" element={<Admin />} />
        </Route> */}
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
