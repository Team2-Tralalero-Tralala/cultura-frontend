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
import { ManageRefundBookingMember } from '@/Pages/Member/ManageRefundBookingPage';


export default function MemberRoutes() {
  return (
    <Routes>
      <Route path="/bookings/refunded-pending" element={<ManageRefundBookingMember />} />
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
    </Routes>
  );
}
