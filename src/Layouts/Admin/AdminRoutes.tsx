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
import Feedbackall from '@/Pages/Admin/FeedbackAll';
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
import {ManageRefundBooking} from "@/Pages/Admin/ManageRefundBooking"
import PackageHistoryAdmin from "@/Pages/Admin/HistoryPackageAdmin";
import PackageFeedbacksPage from "@/Pages/Admin/PackageFeedbacksPage";
import { DashboardPage } from "@/Pages/Admin/DashboardPage";
import ManageBooking from "@/Pages/Admin/ManageBookingAdmin";
import ManageMembers from '@/Pages/Admin/ManageMembers';
import BookingHistoryAdmin from "@/Pages/Admin/BookingHistoryAdmin";
import DetailPackageHistoryAdmin from "@/Pages/Admin/DetailPackageHistoryAdmin";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/package/feedbacks" element={<Feedbackall />} />

      {/* <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}

      <Route path="community/own/edit" element={<EditCommunity />} />
      <Route path="community/store/create" element={<CreateStore />} />
      <Route path="community/store/:storeId/edit" element={<EditStore />} />
      <Route path="/community/homestay" element={<CreateHomestaysPage />} />
      <Route path="/community/homestay/edit/:homestayId" element={<EditHomestayPage />} />
      <Route path="/bookings-histories/done" element={<BookingHistoryAdmin />} />
      {/*<Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}
      {/* <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} /> */}
      <Route path="community/homestay/:homestayId" element={<DetailHomestayAdmin />} />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

      <Route path="/community/own" element={<CommunityDetailAdmin />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequiredPage />} />
      <Route path="package/requests" element={<PackageRequestsAdmin />} />
      <Route path="community/homestay/:homestayId" element={<DetailHomestayAdmin />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />


      <Route path="/booking/refunds" element={<ManageRefundBooking />} />
      <Route path="/members" element={<ManageMembers />} />

      {/* หน้าตารางประวัติแพ็กเกจที่สิ้นสุดไปแล้ว Admin */}
      <Route path="/package/histories" element={<PackageHistoryAdmin />} />
       {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="package/feedback/:packageId" element={<PackageFeedbacksPage />} />
      {/* หน้าตารางการจองทั้งหมดในชุมชนของ Admin */}
      <Route path="/bookings" element={<ManageBooking />} />

      {/* ---------------- แพ็กเกจ ---------------- */}
      <Route path="package/history/:packageId" element={<DetailPackageHistoryAdmin />} />
    </Routes>
  );
}
