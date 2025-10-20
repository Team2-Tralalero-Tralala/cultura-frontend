/**
 * Component: AdminRoutes
 * คำอธิบาย:
 * เส้นทาง (Routing) สำหรับผู้ดูแลระดับวิสาหกิจชุมชน (Admin)
 * เป็น Route ย่อยที่ใช้ร่วมกับ AdminLayout
 * หน้าที่:
 * - กำหนดหน้า/Route ที่ Admin สามารถเข้าถึงได้
 * - แสดง Component ที่ตรงกับแต่ละ path
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookingHistoryAdmin from '@/Pages/Admin/BookingHistoryAdmin';
{/* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
    </Routes>
    
  );
};

export default AdminRoutes;