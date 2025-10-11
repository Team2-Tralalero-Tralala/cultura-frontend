import { Route, Routes, Navigate } from "react-router";
import { CreateCommuninityPage } from "./Page/SuperAdmin/CreateCommuninityPage";
import { EditCommunityPage } from "./Page/SuperAdmin/EditCommunityPage";

import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "./Layouts/SuperAdmin/SuperAdminRoutes";

import AdminLayout from "./Layouts/Admin/AdminLayout";
import AdminRoutes from "./Layouts/Admin/AdminRoutes";

import MemberLayout from "./Layouts/Member/MemberLayout";
import MemberRoutes from "./Layouts/Member/MemberRoutes";

function App() {
  return (
    <Routes>
      {/* ถ้าไม่ตรง route ไหนเลย → redirect กลับหน้าแรก */}

      <Route path="/super/*" element={<SuperAdminLayout />}>
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<SuperAdminRoutes />} />
      </Route>
      <Route path="/admin/*" element={<AdminLayout />}>
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<AdminRoutes />} />
      </Route>
      <Route path="/member/*" element={<MemberLayout />}>
        <Route path="*" element={<MemberRoutes />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
