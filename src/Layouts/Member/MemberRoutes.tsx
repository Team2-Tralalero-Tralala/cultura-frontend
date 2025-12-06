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
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import ManagePackagePage from '@/Pages/Member/ManagePackagePage';
import { EditPackagePage } from '@/Pages/Member/EditPackagePage';
import CreatePackagePage from '@/Pages/Member/CreatePackagePage';

export default function MemberRoutes() {
  return (
    <Routes>
      
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/:id/edit" element={<EditPackagePage />} />
      <Route path="package/create" element={<CreatePackagePage />} />
    </Routes>
  );
}
