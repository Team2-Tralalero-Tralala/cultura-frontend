import { Routes, Route, Navigate } from "react-router-dom";

// Layout เฉพาะ SuperAdmin
import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";

// DEV Login สำหรับทดสอบ
import { superLogin } from "./Libs/dev-login";

// ✅ หน้าจัดการชุมชน
import ManageCommunitySuperAdmin from "./Pages/SuperAdmin/ManageCommunitySuperAdmin";

// 🔹 Auto login (เฉพาะตอน dev)
if (import.meta.env.DEV) {
  superLogin(); // login อัตโนมัติเป็น superadmin
import { Route, Routes, Navigate } from "react-router";
// import ProtectedRoute from "./Libs/ProtectedRoute";
import RoleRedirect from "./Libs/RoleRedirect";

import LoginAdmin from "./Pages/LoginAdmin.tsx";
// import Register from "./Pages/Register.tsx";
// import ForgotPassword from "./Pages/ForgotPassword.tsx";
import LoginTourist from "./Pages/LoginTourist.tsx";

function App() {
  return (
    <>
      <Routes>
        {/* public */}
        <Route path="guest/login" element={<LoginTourist />} />
        <Route path="guest/partner/login" element={<LoginAdmin />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

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

export default function App() {
  return (
    <Routes>
      {/* ================= Superadmin ================= */}
      <Route path="/super" element={<SuperAdminLayout />}>
        {/* ✅ จัดการชุมชน */}
        <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      </Route>

      {/* ================= Default ================= */}
      <Route path="*" element={<Navigate to="/super/communities" replace />} />
    </Routes>
  );
}
