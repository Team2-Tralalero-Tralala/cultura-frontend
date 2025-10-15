// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// {/* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/ }
// //import CommunityManagement from '../../Pages/SuperAdmin/ManageCommunity';

// const SuperAdminRoutes: React.FC = () => {
//   return (
//     <Routes>
//       {/* 
//       <Route path="communities/all" element={<CommunityManagement />} />
//       <Route path="accounts/all" element={<ManageAccount />} />
// */}
//     </Routes>
//   );
// };

// export default SuperAdminRoutes;
// src/Layouts/SuperAdmin/SuperAdminRoutes.tsx
import { Route, Routes } from "react-router-dom";
import ManageCommunitySuperAdmin from "@/Pages/SuperAdmin/ManageCommunitySuperAdmin";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/CommunityDetailSuperAdmin";
// (ในอนาคตค่อยเพิ่ม route อื่น ๆ เช่น ManagePackageSuperAdmin, ManageUserSuperAdmin ฯลฯ)

export default function SuperAdminRoutes() {
  return (
    <Routes>
      {/* ✅ ตารางจัดการชุมชน */}
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />

      {/* ✅ หน้ารายละเอียดชุมชน (เชื่อมกับปุ่ม “ชื่อชุมชน” ในตาราง) */}
      <Route path="community/detail/:id" element={<CommunityDetailSuperAdmin />} />

      {/* เพิ่มเส้นทางอื่นของ superadmin ได้ตามต้องการ */}
    </Routes>
  );
}
