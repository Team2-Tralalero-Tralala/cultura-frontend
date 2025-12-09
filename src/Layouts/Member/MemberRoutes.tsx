/**
 * Component: MemberRoutes
 * คำอธิบาย:
 * กำหนดเส้นทาง (Routes) ทั้งหมดที่สมาชิก (Member) ใช้งานได้
 * โดยจะใช้ร่วมกับ MemberLayout ผ่าน <Outlet />
 * หน้าที่:
 * - รวมทุกหน้าในหมวดหมู่ "สมาชิก"
 * - ระบุ path และ component ที่ควรแสดงเมื่อเข้าหน้านั้น
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import { DashboardPage } from "@/Pages/Member/DashboardPage";
import CommunityDetailMember from "@/Pages/Member/CommunityDetailMember";
import PackageHistoryMember from '@/Pages/Member/HistoryPackageMember';
import DetailPackageMember from '@/Pages/Member/DetailPackageMember';
import PackageFeedbacksPage from "@/Pages/Member/PackageFeedbacksPage";
import BookingDetailMember from "@/Pages/Member/BookingDetailMember";

export default function MemberRoutes() {
  return (
    <Routes>
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />

      {/* ---------------- แพ็กเกจ ---------------- */}
      <Route path="package/:id" element={<DetailPackageMember/>} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/booking/:bookingId" element={<BookingDetailMember />} />
      <Route path="/community/own" element={<CommunityDetailMember />} />
      <Route path="packages/done" element={<PackageHistoryMember />} />
      
      {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="package/feedbacks/:packageId" element={<PackageFeedbacksPage />} />
    </Routes>
  );
}
