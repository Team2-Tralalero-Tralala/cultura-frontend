/**
 * Component: AdminRoutes
 * คำอธิบาย:
 * เส้นทาง (Routing) สำหรับผู้ดูแลระดับวิสาหกิจชุมชน (Admin)
 * เป็น Route ย่อยที่ใช้ร่วมกับ AdminLayout
 * หน้าที่:
 * - กำหนดหน้า/Route ที่ Admin สามารถเข้าถึงได้
 * - แสดง Component ที่ตรงกับแต่ละ path
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManageStoreAdmin from "@/Pages/Admin/ManageStoreAdmin";
import DetailHomestayAdmin from "@/Pages/Admin/DetailHomestayAdmin";
import CreateHomestaysPage from "@/Pages/Admin/CreateHomestaysPage";
import EditHomestayPage from "@/Pages/Admin/EditHomestayPage";
import DetailPackageRequiredPage from "@/Pages/Admin/DetailPackageRequiredPage";
import { CreateStore } from "@/Pages/Admin/CreateStore";
import { EditCommunity } from "@/Pages/Admin/EditCommunityPage";
import { EditStore } from "@/Pages/Admin/EditStore";
import CommunityDetailAdmin from "@/Pages/Admin/CommunityDetailAdmin";
import PackageFeedbacksPage from "@/Pages/Admin/PackageFeedbacksPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="community/own/edit" element={<EditCommunity />} />
      <Route path="community/store/create" element={<CreateStore />} />
      <Route path="community/store/:storeId/edit" element={<EditStore />} />
      <Route path="/community/homestay" element={<CreateHomestaysPage />} />
      <Route path="/community/homestay/edit/:homestayId" element={<EditHomestayPage />} />
      {/* <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} /> */}
      {/* <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} /> */}
      <Route path="community/homestay/:homestayId" element={<DetailHomestayAdmin />} />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

      <Route path="/community/own" element={<CommunityDetailAdmin />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequiredPage />} />
      <Route path="community/homestay/:homestayId" element={<DetailHomestayAdmin />} />

      {/* หน้าตารางร้านค้าทั้งหมดของในชุมชนของ Admin */}
      <Route path="/community/stores" element={<ManageStoreAdmin />} />

       {/* ข้อเสนอแแนะทั้งหมดในแพ็กเกจ */}
      <Route path="packages/feedbacks/:packageId" element={<PackageFeedbacksPage />} />

    </Routes>
  );
}
