/**
 * Component: SuperAdminRoutes
 * คำอธิบาย: กำหนดเส้นทาง (Route) ภายในระบบหลังบ้านของผู้ดูแลระดับสูง (Super Admin)
 * หน้าที่หลัก:
 * - ใช้ <Routes> และ <Route> จาก react-router-dom เพื่อ map path → component
 * - จัดการหน้า/เส้นทางต่าง ๆ เช่น:
 *   - จัดการชุมชน
 *   - จัดการบัญชี
 * - สามารถกำหนด route ย่อยภายใต้ path เช่น `/super/...`
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

{/* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/ }
//import CommunityManagement from '../../Pages/SuperAdmin/ManageCommunity';

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/edit/:communityId" element={<EditCommunity />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/edit/:id" element={<EditPackagePage />} />
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      <Route
        path="community/detail/:id"
        element={<CommunityDetailSuperAdmin />}
      />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
    </Routes>
  );
}
