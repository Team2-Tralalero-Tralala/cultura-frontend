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
