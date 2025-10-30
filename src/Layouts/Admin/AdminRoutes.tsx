/**
 * Component: AdminRoutes
 * คำอธิบาย:
 * เส้นทาง (Routing) สำหรับผู้ดูแลระดับวิสาหกิจชุมชน (Admin)
 * เป็น Route ย่อยที่ใช้ร่วมกับ AdminLayout
 * หน้าที่:
 * - กำหนดหน้า/Route ที่ Admin สามารถเข้าถึงได้
 * - แสดง Component ที่ตรงกับแต่ละ path
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ManageStoreAdmin from '@/Pages/Admin/ManageStoreAdmin';
import CommunityDetailAdmin from '@/Pages/Admin/CommunityDetailAdmin';
import DetailHomestayAdmin from '@/Pages/Admin/DetailHomestayAdmin';


export default function AdminRoutes() {
  return (
    <Routes>
      {/* <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}
      {/* <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} /> */}
    <Route
        path="community/homestay/:homestayId"
        element={<DetailHomestayAdmin />}
      />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

      <Route path="/community/own" element={<CommunityDetailAdmin />} />
    </Routes>
  );
};


