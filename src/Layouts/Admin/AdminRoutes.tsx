/**
 * คำอธิบาย : Component สำหรับ Route ของผู้ดูแลระดับวิสาหกิจชุมชน (Admin)
 * เป็น Route ย่อยที่ใช้ร่วมกับ AdminLayout
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MemberDetailPage } from "@/Pages/Admin/MemberDetailPage";
import Feedbackall from "@/Pages/Admin/FeedbackAll";
import ManageStoreAdmin from "@/Pages/Admin/ManageStoreAdmin";
import DetailHomestayAdmin from "@/Pages/Admin/DetailHomestayAdmin";
import CreateHomestaysPage from "@/Pages/Admin/CreateHomestaysPage";
import EditHomestayPage from "@/Pages/Admin/EditHomestayPage";
import DetailPackageRequiredPage from "@/Pages/Admin/DetailPackageRequiredPage";
import { CreateStore } from "@/Pages/Admin/CreateStore";
import { EditCommunity } from "@/Pages/Admin/EditCommunityPage";
import { EditStore } from "@/Pages/Admin/EditStore";
import CommunityDetailAdmin from "@/Pages/Admin/CommunityDetailAdmin";
import PackageRequestsAdmin from "@/Pages/Admin/ManagePackageRequestPage";
import { ManageRefundBooking } from "@/Pages/Admin/ManageRefundBooking";
import PackageHistoryAdmin from "@/Pages/Admin/HistoryPackageAdmin";
import PackageFeedbacksPage from "@/Pages/Admin/PackageFeedbacksPage";
import { DashboardPage } from "@/Pages/Admin/DashboardPage";
import ManageBooking from "@/Pages/Admin/ManageBookingAdmin";
import ManageMembers from "@/Pages/Admin/ManageMembers";
import BookingHistoryAdmin from "@/Pages/Admin/BookingHistoryAdmin";
import DetailPackageHistoryAdmin from "@/Pages/Admin/DetailPackageHistoryAdmin";
import BookingDetailAdmin from "@/Pages/Admin//BookingDetailAdmin";
import ManageHomestayAdmin from "@/Pages/Admin/ManageHomestayPage";
import StoreDetailAdmin from "@/Pages/Admin/StoreDetailAdmin";
import PackageDraftAdmin from "@/Pages/Admin/PackageDraftAdmin";
import EditPackagePage from "@/Pages/Admin/EditPackagePage";
import ManagePackagePage from "@/Pages/Admin/ManagePackagePage";
import CreatePackagePage from "@/Pages/Admin/CreatePackagePage";
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import DetailPackageAdmin from "@/Pages/Admin/DetailPackageAdmin";
import CreateMemberPage from "@/Pages/Admin/CreateMemberPage";
import EditMemberPage from "@/Pages/Admin/EditMemberPage";
import AuthentionLogAdmin from "@/Pages/Admin/AuthentionLogAdmin";
import { EditProfile } from "@/Pages/SuperAdmin/EditProfile";
import { ManageParticipant } from "@/Pages/Admin/ManageParticipant";
import BookingDetailStatus from "@/Pages/Admin/BookingDetailStatus";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Route ของผู้ใช้กลุ่ม Admin
 * Input : -
 * Output : ส่วนแสดงผล Route
 */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="member/:userId" element={<MemberDetailPage />} />
      <Route path="/packages/feedbacks" element={<Feedbackall />} />

      {/* <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}

      <Route path="community/own/edit" element={<EditCommunity />} />
      <Route path="community/store/create" element={<CreateStore />} />
      <Route path="community/store/:storeId/edit" element={<EditStore />} />
      <Route path="/community/homestay" element={<CreateHomestaysPage />} />
      <Route path="/community/homestay/:homestayId/edit" element={<EditHomestayPage />} />
      <Route path="/bookings-histories/all" element={<BookingHistoryAdmin />} />
      <Route path="/bookings-histories/:bookingId" element={<BookingDetailStatus />} />
      {/*<Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}
      {/* <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} /> */}

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

      <Route path="/booking/:bookingId" element={<BookingDetailAdmin />} />

      <Route path="/community/homestays" element={<ManageHomestayAdmin />} />

      <Route path="/community/own" element={<CommunityDetailAdmin />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequiredPage />} />
      <Route path="package-requests" element={<PackageRequestsAdmin />} />
      <Route path="community/homestay/:homestayId" element={<DetailHomestayAdmin />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

      <Route path="/booking/refunds" element={<ManageRefundBooking />} />
      <Route path="/members" element={<ManageMembers />} />
      <Route path="/member/create" element={<CreateMemberPage />} />
      <Route path="/member/:userId/edit" element={<EditMemberPage />} />
      {/* หน้าตารางประวัติแพ็กเกจที่สิ้นสุดไปแล้ว Admin */}
      <Route path="/package/histories" element={<PackageHistoryAdmin />} />
      {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="package/feedbacks/:packageId" element={<PackageFeedbacksPage />} />
      {/* หน้าตารางการจองทั้งหมดในชุมชนของ Admin */}
      <Route path="/bookings" element={<ManageBooking />} />
      {/* หน้าดูรายละเอียดร้านค้าของ Admin */}
      <Route path="/community/store/:id" element={<StoreDetailAdmin />} />

      {/* ---------------- แพ็กเกจ ---------------- */}
      <Route path="package/history/:id" element={<DetailPackageHistoryAdmin />} />
      <Route path="packages/drafts" element={<PackageDraftAdmin />} />
      <Route path="packages/histories" element={<PackageHistoryAdmin />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/create" element={<CreatePackagePage />} />
      <Route path="package/:id/edit" element={<EditPackagePage />} />
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="package/:id" element={<DetailPackageAdmin />} />
      <Route path="logs" element={<AuthentionLogAdmin />} />
      <Route path="participants/package/:packageId" element={<ManageParticipant />} />
      <Route path="profile-me" element={<EditProfile />} />
    </Routes>
  );
}
