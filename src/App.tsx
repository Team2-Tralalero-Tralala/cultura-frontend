import { Route, Routes, Navigate } from "react-router";

import SuperAdminLayout from './Layouts/SuperAdmin/SuperAdminLayout';
import SuperAdminRoutes from './Layouts/SuperAdmin/SuperAdminRoutes';

import AdminLayout from './Layouts/Admin/AdminLayout';
import AdminRoutes from './Layouts/Admin/AdminRoutes';

import MemberLayout from './Layouts/Member/MemberLayout';
import MemberRoutes from './Layouts/Member/MemberRoutes';


function SidebarForSuperAdmin() {
  return (
    <Routes>
      <Route path="/super/*" element={<SuperAdminLayout />}>
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<SuperAdminRoutes />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/super/" replace />} />
    </Routes>
  );
}

function SidebarForAdmin() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminLayout />}>
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<AdminRoutes />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin/" replace />} />
    </Routes>
  );
}

function SidebarForMember() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/member/*" element={<MemberLayout />}>
            <Route path="*" element={<MemberRoutes />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      
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
