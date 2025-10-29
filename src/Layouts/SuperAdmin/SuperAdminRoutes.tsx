import { Routes, Route } from "react-router-dom";

import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import ManagePackagePage from "@/Pages/SuperAdmin/ManagePackagePage";
import EditPackagePage from "@/Pages/SuperAdmin/EditPackagePage";
import ManageCommunitySuperAdmin from "@/Pages/SuperAdmin/ManageCommunitySuperAdmin";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/CommunityDetailSuperAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";

import { BlockedAccountPage } from "@/Pages/SuperAdmin/BlockUserPage";
import { UserDetailPage } from "@/Pages/SuperAdmin/UserDetailPage";
import { ManageAccountPage } from "@/Pages/SuperAdmin/ManageAccountPage";

import DetailPackageRequriedPage from "@/Pages/SuperAdmin/DetailPackageRequiredPage";
import ChangePasswordPage from "@/Pages/SuperAdmin/ChangePasswordPage";
import ManagePackageRequestPage from "@/Pages/SuperAdmin/ManagePackageRequestPage";
import CreateHomestaysPage from "@/Pages/SuperAdmin/CreateHomestaysPage";
import EditHomestayPage from "@/Pages/SuperAdmin/EditHomestayPage";
import { CreateStore } from "@/Pages/SuperAdmin/CreateStore";
import { EditStore } from "@/Pages/SuperAdmin/EditStore";
import { ResetPassword } from "@/Pages/SuperAdmin/ResetPassword";
import ManageHomestaySuperAdmin from "@/Pages/SuperAdmin/ManageHomestaySuperAdmin";
import HomestayDetailPage from "@/Pages/SuperAdmin/DetailHomestayPage";

import ManageStores from "@/Pages/SuperAdmin/ManageStoreSuperAdmin";

import CreateAccountPage from "../../Layouts/SuperAdmin/CreateAccountPage";
import EditAccountPage from "../../Layouts/SuperAdmin/EditAccountPage";

/*
 * Module: SuperAdminRoutes
 * Description: กำหนดเส้นทาง (Routes) สำหรับ Super Admin
 * - สามารถสร้างและแก้ไขบัญชีได้ 3 ประเภท (Admin / Member / Tourist)
 * - เมื่อเปลี่ยน role ในหน้า CreateAccountPage จะเปลี่ยน path อัตโนมัติ
 */

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/:communityId/edit" element={<EditCommunity />} />
      {/* <Route path="packages/all" element={<ManagePackagePage />} /> */}
      <Route path="package/edit/:id" element={<EditPackagePage />} />
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      <Route path="community/:id" element={<CommunityDetailSuperAdmin />} />
      <Route
        path="/community/:communityId/store/create"
        element={<CreateStore />}
      />
      <Route path="/store/:storeId/edit" element={<EditStore />} />
      <Route path="/reset-password/:userId" element={<ResetPassword />} />

      <Route
        path="community/:communityId/homestay/:homestayId"
        element={<HomestayDetailPage />}
      />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="package-requests/:requestId" element={<DetailPackageRequriedPage />}/>
      <Route path="account/change-password" element={<ChangePasswordPage />} />
      <Route path="package-requests" element={<ManagePackageRequestPage />} />
      <Route path="community/:communityId/homestay/create" element={<CreateHomestaysPage />} />
      <Route path="homestay/edit/:homestayId" element={<EditHomestayPage />} />

      <Route
        path="community/:communityId/stores/all"
        element={<ManageStores />}
      />
      <Route
        path="community/:communityId/homestays/all"
        element={<ManageHomestaySuperAdmin />}
      />
            {/* 🔹 หน้าเพิ่มบัญชีผู้ดูแลระบบ (Admin) */}
            <Route
        path="/admin/create"
        element={<CreateAccountPage defaultRole="Admin" />}
      />

      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="users/blocked" element={<BlockedAccountPage />} />
      <Route path="users/:id" element={<UserDetailPage />} />
      <Route path="accounts" element={<ManageAccountPage />} />
      {/* 🔹 หน้าเพิ่มบัญชีสมาชิก (Member) */}
      <Route
        path="/member/create"
        element={<CreateAccountPage defaultRole="Member" />}
      />

      {/* 🔹 หน้าเพิ่มบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route
        path="/tourist/create"
        element={<CreateAccountPage defaultRole="Tourist" />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ดูแลระบบ (Admin) */}
      <Route
        path="/admin/:adminId/edit"
        element={<EditAccountPage />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีสมาชิก (Member) */}
      <Route
        path="/member/:memberId/edit"
        element={<EditAccountPage />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route
        path="/tourist/:touristId/edit"
        element={<EditAccountPage />}
      />
    </Routes>
  );
}
