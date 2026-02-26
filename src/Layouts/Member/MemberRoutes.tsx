/**
 * คำอธิบาย : Component สำหรับ Route ของสมาชิก (Member)
 * เป็น Route ย่อยที่ใช้ร่วมกับ MemberLayout
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import { CreatePackagePage } from "@/Pages/Member/CreatePackagePage";
import { DashboardPage } from "@/Pages/Member/DashboardPage";
import { DetailBookingPage } from "@/Pages/Member/DetailBookingPage";
import { DetailCommunityPage } from "@/Pages/Member/DetailCommunityPage";
import { DetailFeedbackPage } from "@/Pages/Member/DetailFeedbackPage";
import { DetailPackagePage } from "@/Pages/Member/DetailPackagePage";
import { EditPackagePage } from "@/Pages/Member/EditPackagePage";
import { FeedbackPage } from "@/Pages/Member/FeedbackPage";
import { ManageBookingHistoryPage } from "@/Pages/Member/ManageBookingHistoryPage";
import { ManageBookingPage } from "@/Pages/Member/ManageBookingPage";
import { ManageDraftPackage } from "@/Pages/Member/ManageDraftPackage";
import { ManagePackageHistoryPage } from "@/Pages/Member/ManagePackageHistoryPage";
import { ManagePackagePage } from "@/Pages/Member/ManagePackagePage";
import { ManageRefundPage } from "@/Pages/Member/ManageRefundPage";
import ManageDraftPackagePage from "@/Pages/Admin/ManageDraftPackagePage";
import { EditProfilePage } from "@/Pages/SuperAdmin/EditProfilePage";
import ManageParticipantPage from "@/Pages/Admin/ManageParticipantPage";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Route ของผู้ใช้กลุ่ม Member
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Route
 */
export default function MemberRoutes() {
  return (
    <Routes>
      <Route path="/bookings/refunded-pending" element={<ManageRefundPage />} />

      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="feedbacks" element={<FeedbackPage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/:id/edit" element={<EditPackagePage />} />
      <Route path="package/create" element={<CreatePackagePage />} />

      {/* แพ็กเกจ */}
      <Route path="package/:id" element={<DetailPackagePage />} />
      <Route path="bookings/all" element={<ManageBookingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/booking/:bookingId" element={<DetailBookingPage />} />
      <Route path="bookings-histories" element={<ManageBookingHistoryPage />} />
      <Route path="/community/own" element={<DetailCommunityPage />} />
      <Route path="package/history/:id" element={<DetailPackagePage />} />
      <Route path="packages/done" element={<ManagePackageHistoryPage />} />
      <Route path="participants/package/:packageId" element={<ManageParticipantPage />} />
      <Route path="packages/draft" element={<ManageDraftPackage />} />

      {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="package/feedbacks/:packageId" element={<DetailFeedbackPage />} />

      <Route path="profile-me" element={<EditProfilePage />} />
    </Routes>
  );
}
