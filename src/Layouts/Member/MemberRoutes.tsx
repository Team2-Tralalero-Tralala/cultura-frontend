/**
 * คำอธิบาย : Component สำหรับ Route ของสมาชิก (Member)
 * เป็น Route ย่อยที่ใช้ร่วมกับ MemberLayout
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import Feedback from "@/Pages/Member/Feedback";

import ManagePackagePage from "@/Pages/Member/ManagePackagePage";
import { EditPackagePage } from "@/Pages/Member/EditPackagePage";
import CreatePackagePage from "@/Pages/Member/CreatePackagePage";
import { ManageRefundBookingMember } from "@/Pages/Member/ManageRefundBookingPage";

import ManageBookingMember from "@/Pages/Member/ManageBookingMember";
import { DashboardPage } from "@/Pages/Member/DashboardPage";
import CommunityDetailMember from "@/Pages/Member/CommunityDetailMember";
import PackageHistoryMember from "@/Pages/Member/HistoryPackageMember";
import DetailPackageMember from "@/Pages/Member/DetailPackageMember";
import PackageFeedbacksPage from "@/Pages/Member/PackageFeedbacksPage";
import BookingDetailMember from "@/Pages/Member/BookingDetailMember";
import PackageDraftAdmin from "@/Pages/Admin/MangeDraftPackagePage";
import PackageDraftMember from "@/Pages/Member/PackageDraftMember";
import { EditProfile } from "@/Pages/SuperAdmin/EditProfile";
import BookingHistoryMember from "@/Pages/Member/HistoryBookingMember";
import { ManageParticipant } from "@/Pages/Admin/ManageParticipantPage";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Route ของผู้ใช้กลุ่ม Member
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Route
 */
export default function MemberRoutes() {
  return (
    <Routes>
      <Route path="/bookings/refunded-pending" element={<ManageRefundBookingMember />} />

      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="feedbacks" element={<Feedback />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/:id/edit" element={<EditPackagePage />} />
      <Route path="package/create" element={<CreatePackagePage />} />

      {/* แพ็กเกจ */}
      <Route path="package/:id" element={<DetailPackageMember />} />
      <Route path="bookings/all" element={<ManageBookingMember />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/booking/:bookingId" element={<BookingDetailMember />} />
      <Route path="bookings-histories" element={<BookingHistoryMember />} />
      <Route path="/community/own" element={<CommunityDetailMember />} />
      <Route path="packages/done" element={<PackageHistoryMember />} />
      <Route path="participants/package/:packageId" element={<ManageParticipant />} />
      <Route path="packages/draft" element={<PackageDraftMember />} />

      {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="package/feedbacks/:packageId" element={<PackageFeedbacksPage />} />

      <Route path="profile-me" element={<EditProfile />} />
    </Routes>
  );
}
