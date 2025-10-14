import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";

// Public pages
import LoginAdmin from "./Pages/LoginAdmin";
import LoginTourist from "./Pages/LoginTourist";
import RoleRedirect from "./Libs/RoleRedirect";

// Guards
import ProtectedRoute from "./Libs/ProtectRoute";

// Superadmin pages
import ManageCommunitySuperAdmin from "./Pages/SuperAdmin/ManageCommunitySuperAdmin";
import CommunityDetailSuperAdmin from "./Pages/SuperAdmin/CommunityDetailSuperAdmin";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/guest/login" element={<LoginTourist />} />
      <Route path="/guest/partner/login" element={<LoginAdmin />} />

      {/* Root → redirect by role */}
      <Route index element={<RoleRedirect />} />

      {/* Superadmin (protected) */}
      <Route element={<ProtectedRoute allow={["superadmin"]} redirectTo="/guest/partner/login" />}>
        <Route path="/super" element={<SuperAdminLayout />}>
          <Route path="communities" element={<ManageCommunitySuperAdmin />} />
           <Route path="community/detail/:id" element={<CommunityDetailSuperAdmin />} />
          
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

