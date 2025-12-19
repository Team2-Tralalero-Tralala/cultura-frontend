import { Route, Routes } from "react-router-dom";

import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";
import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import ManagePackagePage from "@/Pages/SuperAdmin/ManagePackagePage";
import UploadBannerPage from "@/Pages/SuperAdmin/UploadBannerPage";

import { BlockedAccountPage } from "@/Pages/SuperAdmin/BlockUserPage";
import { ManageAccountPage } from "@/Pages/SuperAdmin/ManageAccountPage";
import { UserDetailPage } from "@/Pages/SuperAdmin/UserDetailPage";

import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/CommunityDetailSuperAdmin";
import ManagePackageRequestPage from "@/Pages/SuperAdmin/ManagePackageRequestPage";

import CreateHomestaysPage from "@/Pages/SuperAdmin/CreateHomestaysPage";
import { CreateStore } from "@/Pages/SuperAdmin/CreateStore";
import HomestayDetailPage from "@/Pages/SuperAdmin/DetailHomestayPage";
import DetailPackageRequriedPage from "@/Pages/SuperAdmin/DetailPackageRequiredPage";
import EditHomestayPage from "@/Pages/SuperAdmin/EditHomestayPage";
import EditPackagePage from "@/Pages/SuperAdmin/EditPackagePage";
import { EditStore } from "@/Pages/SuperAdmin/EditStore";
import ManageCommunitySuperAdmin from "@/Pages/SuperAdmin/ManageCommunitySuperAdmin";
import ManageHomestaySuperAdmin from "@/Pages/SuperAdmin/ManageHomestaySuperAdmin";
import ManageStores from "@/Pages/SuperAdmin/ManageStoreSuperAdmin";
import { ResetPassword } from "@/Pages/SuperAdmin/ResetPassword";

import BackupsPage from "@/Pages/SuperAdmin/BackupsPage";
import SettingHomePage from "@/Pages/SuperAdmin/SettingHomePage";
import ToggleSystemPage from "@/Pages/SuperAdmin/ToggleSystemPage";
import CreateAccountPage from "@/Pages/SuperAdmin/CreateAccountPage";
import EditAccountPage from "@/Pages/SuperAdmin/EditAccountPage";

import DashboardPage from "@/Pages/SuperAdmin/DashboardPage";
import { ManageTags } from "@/Pages/SuperAdmin/ManageTags";
import DetailPackageSuperAdmin from "@/Pages/SuperAdmin/DetailPackageSuperAdmin";
import { ManageAccountCommunity } from "@/Pages/SuperAdmin/ManageAccountCommunity";
import StoreDetailPage from "@/Pages/SuperAdmin/StoreDetailSuperAdmin";
import { EditProfile } from "@/Pages/SuperAdmin/EditProfile";

/*
 * Module: SuperAdminRoutes
 * Description: กำหนดเส้นทาง (Routes) สำหรับ Super Admin
 * - สามารถสร้างและแก้ไขบัญชีได้ 3 ประเภท (Admin / Member / Tourist)
 * - เมื่อเปลี่ยน role ในหน้า CreateAccountPage จะเปลี่ยน path อัตโนมัติ
 */

export default function SuperAdminRoutes() {
  return (
    <Routes>
      {/* ---------------- ชุมชน ---------------- */}
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/edit/:communityId" element={<EditCommunity />} />
      <Route path="communities/all" element={<ManageCommunitySuperAdmin />} />
      <Route path="community/detail/:id" element={<CommunityDetailSuperAdmin />} />

      {/* ---------------- แพ็กเกจ ---------------- */}
      <Route path="community/:communityId/edit" element={<EditCommunity />} />
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
      <Route path="account/reset-password/:userId" element={<ResetPassword />} />

      {/* ---------------- Log ---------------- */}
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      <Route path="community/:id" element={<CommunityDetailSuperAdmin />} />
      <Route path="/community/:communityId/store/create" element={<CreateStore />} />
      <Route path="/community/:communityId/store/:storeId/edit" element={<EditStore />} />
      <Route path="/reset-password/:userId" element={<ResetPassword />} />

      <Route path="community/:communityId/homestay/:homestayId" element={<HomestayDetailPage />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="banners" element={<UploadBannerPage />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />} />
      <Route path="account/change-password/own" element={<ChangePasswordPage />} />
      <Route path="package-requests" element={<ManagePackageRequestPage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="shared/tags" element={<ManageTags />} />
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

      <Route path="community/:communityId/stores/all" element={<ManageStores />} />
      <Route path="community/:communityId/homestay/all" element={<ManageHomestaySuperAdmin />} />
      {/* 🔹 หน้าเพิ่มบัญชีผู้ดูแลระบบ (Admin) */}
      <Route path="/admin/create" element={<CreateAccountPage defaultRole="Admin" />} />

      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="users/blocked" element={<BlockedAccountPage />} />
      <Route path="account/:id" element={<UserDetailPage />} />
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
      <Route path="/account/community/:communityId" element={<ManageAccountCommunity />} />

      {/* หน้าตารางของ tag */}
      <Route path="tags" element={<ManageTags />} />
      <Route path="profile-me" element={<EditProfile />} />
    </Routes>
  );
}
