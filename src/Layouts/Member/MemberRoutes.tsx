/**
 * Component: MemberRoutes
 * คำอธิบาย:
 * กำหนดเส้นทาง (Routes) ทั้งหมดที่สมาชิก (Member) ใช้งานได้
 * โดยจะใช้ร่วมกับ MemberLayout ผ่าน <Outlet />
 * หน้าที่:
 * - รวมทุกหน้าในหมวดหมู่ "สมาชิก"
 * - ระบุ path และ component ที่ควรแสดงเมื่อเข้าหน้านั้น
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}
//import CommunityMember from '../../Pages/Member/CommunityMember';

const MemberRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 
      <Route path="community" element={<CommunityMember />} />
      <Route path="package/create" element={<CreatePackagePage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/edit/:id" element={<EditPackagePage />} />
      */}
    </Routes>
  );
};

export default MemberRoutes;