/**
 * คำอธิบาย : Component สำหรับ Layout ของผู้ใช้งานระดับซูเปอร์แอดมิน (Super Admin)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าซูเปอร์แอดมินทั้งหมด
 */
import { Route, Routes } from "react-router-dom";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogPage";
import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunityPage } from "@/Pages/SuperAdmin/EditCommunityPage";
import { ManagePackagePage } from "@/Pages/SuperAdmin/ManagePackagePage";
import { UploadBannerPage } from "@/Pages/SuperAdmin/UploadBannerPage";

import { BlockUserPage } from "@/Pages/SuperAdmin/BlockUserPage";
import { ManageAccountPage } from "@/Pages/SuperAdmin/ManageAccountPage";
import { DetailUserPage } from "@/Pages/SuperAdmin/DetailUserPage";

import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/DetailCommunityPage";
import { ManagePackageRequestPage } from "@/Pages/SuperAdmin/ManagePackageRequestPage";

import CreateHomestaysPage from "@/Pages/SuperAdmin/CreateHomestaysPage";
import { CreateStorePage } from "@/Pages/SuperAdmin/CreateStorePage";
import HomestayDetailPage from "@/Pages/SuperAdmin/DetailHomestayPage";
import DetailPackageRequriedPage from "@/Pages/SuperAdmin/DetailPackageRequiredPage";
import EditHomestayPage from "@/Pages/SuperAdmin/EditHomestayPage";
import EditPackagePage from "@/Pages/SuperAdmin/EditPackagePage";
import { EditStorePage } from "@/Pages/SuperAdmin/EditStorePage";
import ManageCommunityPage from "@/Pages/SuperAdmin/ManageCommunityPage";
import ManageHomestayPage from "@/Pages/SuperAdmin/ManageHomestayPage";
import { ManageStorePage } from "@/Pages/SuperAdmin/ManageStorePage";
import { ResetPasswordPage } from "@/Pages/SuperAdmin/ResetPasswordPage";

import BackupsPage from "@/Pages/SuperAdmin/BackupsPage";
import { SettingHomePage } from "@/Pages/SuperAdmin/SettingHomePage";
import { ToggleSystemPage } from "@/Pages/SuperAdmin/ToggleSystemPage";
import CreateAccountPage from "@/Pages/SuperAdmin/CreateAccountPage";
import EditAccountPage from "@/Pages/SuperAdmin/EditAccountPage";

import DashboardPage from "@/Pages/SuperAdmin/DashboardPage";
import { ManageTagPage } from "@/Pages/SuperAdmin/ManageTagPage";
import DetailPackageSuperAdmin from "@/Pages/SuperAdmin/DetailPackagePage";
import { ManageMemberPage } from "@/Pages/SuperAdmin/ManageMemberPage";
import StoreDetailPage from "@/Pages/SuperAdmin/DetailStorePage";
import { EditProfilePage } from "@/Pages/SuperAdmin/EditProfilePage";
import ManageParticipantPage from "@/Pages/Admin/ManageParticipantPage";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Route ของผู้ใช้กลุ่ม Super Admin
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Route
 */
export default function SuperAdminRoutes() {
  return (
    <Routes>
      {/* ---------------- ชุมชน ---------------- */}
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/edit/:communityId" element={<EditCommunityPage />} />
      <Route path="communities/all" element={<ManageCommunityPage />} />
      <Route path="community/detail/:id" element={<CommunityDetailSuperAdmin />} />

      {/* ---------------- แพ็กเกจ ---------------- */}
      <Route path="community/:communityId/edit" element={<EditCommunityPage />} />
      <Route path="package/:id/edit" element={<EditPackagePage />} />
      <Route path="package/:id" element={<DetailPackageSuperAdmin />} />

      {/* ---------------- บัญชีผู้ใช้ ---------------- */}
      <Route path="account/admin/create" element={<CreateAccountPage />} />
      <Route path="account/member/create" element={<CreateAccountPage />} />
      <Route path="account/tourist/create" element={<CreateAccountPage />} />

      <Route path="account/admin/:adminId/edit" element={<EditAccountPage />} />
      <Route path="account/member/:memberId/edit" element={<EditAccountPage />} />
      <Route path="account/tourist/:touristId/edit" element={<EditAccountPage />} />

      {/* 🔹 หน้า Reset Password */}
      <Route path="account/reset-password/:userId" element={<ResetPasswordPage />} />

      {/* ---------------- Log ---------------- */}
      <Route path="communities" element={<ManageCommunityPage />} />
      <Route path="community/:id" element={<CommunityDetailSuperAdmin />} />
      <Route path="/community/:communityId/store/create" element={<CreateStorePage />} />
      <Route path="/community/:communityId/store/:storeId/edit" element={<EditStorePage />} />
      <Route path="/reset-password/:userId" element={<ResetPasswordPage />} />

      <Route path="community/:communityId/homestay/:homestayId" element={<HomestayDetailPage />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="banners" element={<UploadBannerPage />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} />
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="package-requests" element={<ManagePackageRequestPage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="shared/tags" element={<ManageTagPage />} />
      <Route path="community/:communityId/homestay/create" element={<CreateHomestaysPage />} />
      <Route
        path="community/:communityId/homestay/:homestayId/edit"
        element={<EditHomestayPage />}
      />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="setting" element={<SettingHomePage />} />
      <Route path="backups" element={<BackupsPage />} />
      <Route path="toggle-system" element={<ToggleSystemPage />} />
      {/* หน้าดูรายละเอียดร้านค้าของ Super Admin */}
      <Route path="store/:id" element={<StoreDetailPage />} />

      <Route path="community/:communityId/stores/all" element={<ManageStorePage />} />
      <Route path="community/:communityId/homestay/all" element={<ManageHomestayPage />} />
      {/* 🔹 หน้าเพิ่มบัญชีผู้ดูแลระบบ (Admin) */}
      <Route path="/admin/create" element={<CreateAccountPage defaultRole="Admin" />} />

      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="users/blocked" element={<BlockUserPage />} />
      <Route path="account/:id" element={<DetailUserPage />} />
      <Route path="accounts/all" element={<ManageAccountPage />} />
      {/* 🔹 หน้าเพิ่มบัญชีสมาชิก (Member) */}
      <Route path="/member/create" element={<CreateAccountPage defaultRole="Member" />} />

      {/* 🔹 หน้าเพิ่มบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route path="/tourist/create" element={<CreateAccountPage defaultRole="Tourist" />} />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ดูแลระบบ (Admin) */}
      <Route path="/admin/:adminId/edit" element={<EditAccountPage />} />

      {/* 🔸 หน้าแก้ไขบัญชีสมาชิก (Member) */}
      <Route path="/member/:memberId/edit" element={<EditAccountPage />} />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route path="/tourist/:touristId/edit" element={<EditAccountPage />} />
      <Route path="/account/community/:communityId" element={<ManageMemberPage />} />
      <Route path="participants/package/:packageId" element={<ManageParticipantPage />} />

      {/* หน้าตารางของ tag */}
      <Route path="tags" element={<ManageTagPage />} />
      <Route path="profile-me" element={<EditProfilePage />} />
    </Routes>
  );
}
