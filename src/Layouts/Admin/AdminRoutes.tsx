/**
 * Component: AdminRoutes
 * คำอธิบาย:
 * เส้นทาง (Routing) สำหรับผู้ดูแลระดับวิสาหกิจชุมชน (Admin)
 * เป็น Route ย่อยที่ใช้ร่วมกับ AdminLayout
 * หน้าที่:
 * - กำหนดหน้า/Route ที่ Admin สามารถเข้าถึงได้
 * - แสดง Component ที่ตรงกับแต่ละ path
 */
import { CreateStore } from "@/Pages/Admin/CreateStore";
import { EditCommunity } from "@/Pages/Admin/EditCommunityPage";
import { EditStore } from "@/Pages/Admin/EditStore";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="community/own/edit" element={<EditCommunity />} />
      <Route path="community/store/create" element={<CreateStore />} />
      <Route path="community/store/:storeId/edit" element={<EditStore />} />
      {/* <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}
    </Routes>
  );
};

export default AdminRoutes;
