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

export default function AdminRoutes() {
  return (
    <Routes>
      
    
      <Route path="/community/stores" element={<ManageStoreAdmin />} /> 
      
    </Routes>
  );
};


