import { Route, Routes, Navigate } from "react-router";
import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "./Layouts/SuperAdmin/SuperAdminRoutes";

import AdminLayout from "./Layouts/Admin/AdminLayout";
import AdminRoutes from "./Layouts/Admin/AdminRoutes";

import MemberLayout from "./Layouts/Member/MemberLayout";
import MemberRoutes from "./Layouts/Member/MemberRoutes";

import ProtectedRoute from "./Libs/ProtectedRoute";
import LoginTourist from "./Pages/LoginTourist";
import LoginAdmin from "./Pages/LoginAdmin";
import RoleRedirect from "./Libs/RoleRedirect";

function App() {
  return (
    <Routes>
      <Route path="guest/login" element={<LoginTourist />} />
      <Route path="guest/partner/login" element={<LoginAdmin />} />
      <Route index element={<RoleRedirect />} />
      {/* ถ้าไม่ตรง route ไหนเลย → redirect กลับหน้าแรก */}
      <Route
        path="/super/*"
        element={
          <ProtectedRoute allow={["superadmin"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<SuperAdminRoutes />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allow={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<AdminRoutes />} />
      </Route>
      <Route
        path="/member/*"
        element={
          <ProtectedRoute allow={["member"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<MemberRoutes />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
