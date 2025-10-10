import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./Layouts/SuperAdminLayout";
import AdminLayout from "./Layouts/AdminLayout";
import MemberLayout from "./Layouts/MemberLayout";
import { superLogin, adminLogin, memberLogin, touristLogin } from "./Libs/dev-login";

import DashboardSuperAdmin from "./Pages/SuperAdmin/DashboardSuperAdmin";
import ManageCommunity from "./Pages/SuperAdmin/ManageCommunity";
import ManageUser from "./Pages/SuperAdmin/ManageUser";
import BlockUser from "./Pages/SuperAdmin/BlockUser";
import ManagePackageSuperAdmin from "./Pages/SuperAdmin/ManagePackageSuperAdmin";
import ApprovePackage from "./Pages/SuperAdmin/ApprovePackage";
import ManageTag from "./Pages/SuperAdmin/ManageTag";
import LogSuperAdmin from "./Pages/SuperAdmin/LogSuperAdmin";
import Setting from "./Pages/SuperAdmin/Setting";
import LogoutSuperAdmin from "./Pages/SuperAdmin/LogoutSuperAdmin";
import EditPackageSuperAdmin from "./Pages/SuperAdmin/EditPackageSuperAdmin";

/* -------- Member (อัปเดตตามไฟล์จริง) -------- */
import DashboardMember from "./Pages/Member/DashboardMember";
import CommunityMember from "./Pages/Member/CommunityMember";
import ManageBookingMember from "./Pages/Member/ManageBookingMember";
import ManagePackageMember from "./Pages/Member/ManagePackageMember";
import PackageDraftMember from "./Pages/Member/PackageDraftMember";
import CreatePackageMember from "./Pages/Member/CreatePackageMember";
import PackageHistoryMember from "./Pages/Member/PackageHistoryMember";
import PackageReviewMember from "./Pages/Member/PackageReviewMember";
import BookingRefundMember from "./Pages/Member/BookingRefundMember";
import BookingHistoryMember from "./Pages/Member/BookingHistoryMember";
import LogoutMember from "./Pages/Member/LogoutMember";
import EditPackageMember from "./Pages/Member/EditPackageMember";

/* -------- Member (อัปเดตตามไฟล์จริง) -------- */
import CreatePackageAdmin from "./Pages/Admin/CreatePackageAdmin"; // อยู่ในโฟลเดอร์ Admin ตามภาพของคุณ
import EditPackageAdmin from "./Pages/Admin/EditPackageAdmin";     // เช่นเดียวกัน
import PackageDraftAdmin from "./Pages/Admin/PackageDraftAdmin";
import PackageHistoryAdmin from "./Pages/Admin/PackageHistoryAdmin";
import PackageFeedbackAdmin from "./Pages/Admin/PackageFeedbackAdmin";
import PackageRequestAdmin from "./Pages/Admin/PackageRequestAdmin";
import ManageBookingAdmin from "./Pages/Admin/ManageBookingAdmin";
import DashboardAdmin from "./Pages/Admin/DashboardAdmin";
import LogoutAdmin from "./Pages/Admin/LogoutAdmin";
import ManageCommunityAdmin from "./Pages/Admin/ManageCommunityAdmin";
import BlockMember from "./Pages/Admin/BlockMember";
import BookingRefundAdmin from "./Pages/Admin/BookingRefundAdmin";
import BookingHistoryAdmin from "./Pages/Admin/BookingHistoryAdmin";
import ManagePackageAdmin from "./Pages/Admin/ManagePackageAdmin";
if (import.meta.env.DEV) {
  memberLogin();
  // superLogin();
  // adminLogin();
  // touristLogin();
}
export default function App() {
  return (
    <Routes>
      {/* ================= Superadmin ================= */}
      <Route path="/super" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="ping" element={<div style={{ color: 'black' }}>PING OK</div>} />
        <Route path="dashboard" element={<DashboardSuperAdmin />} />
        <Route path="communities" element={<ManageCommunity />} />
        <Route path="users" element={<ManageUser />} />
        <Route path="user/blocked" element={<BlockUser />} />
        <Route path="packages" element={<ManagePackageSuperAdmin />} />
        <Route path="package/:id" element={<EditPackageSuperAdmin />} />
        <Route path="package-requests" element={<ApprovePackage />} />
        <Route path="tags" element={<ManageTag />} />
        <Route path="logs" element={<LogSuperAdmin />} />
        <Route path="setting" element={<Setting />} />
        <Route path="logout" element={<LogoutSuperAdmin />} />
        <Route path="*" element={<Navigate to="/super/dashboard" replace />} />
      </Route>
      {/* ================= Member ================= */}
      <Route path="/member" element={<MemberLayout />}>
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardMember />} />
        <Route path="communities" element={<CommunityMember />} />
        <Route path="packages" element={<ManagePackageMember />} />
        <Route path="package" element={<CreatePackageMember />} />
        <Route path="package/:id" element={<EditPackageMember />} />
        <Route path="package/draft" element={<PackageDraftMember />} />
        <Route path="package/done" element={<PackageHistoryMember />} />
        <Route path="package/reviews" element={<PackageReviewMember />} />
        <Route path="booking" element={<ManageBookingMember />} />
        <Route path="booking/refunds" element={<BookingRefundMember />} />
        <Route path="booking/histories" element={<BookingHistoryMember />} />
        <Route path="logout" element={<LogoutMember />} />
        <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
      </Route>
      {/* ================= Admin ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="communities" element={<ManageCommunityAdmin />} />
        <Route path="users/blocked" element={<BlockMember />} />
        <Route path="packages" element={<ManagePackageAdmin />} />
        <Route path="package" element={<CreatePackageAdmin />} />
        <Route path="package/:id" element={<EditPackageAdmin />} />
        <Route path="package/draft" element={<PackageDraftAdmin />} />
        <Route path="package/done" element={<PackageHistoryAdmin />} />
        <Route path="package/reviews" element={<PackageFeedbackAdmin />} />
        <Route path="package-requests" element={<PackageRequestAdmin />} />
        <Route path="booking" element={<ManageBookingAdmin />} />
        <Route path="booking/refunds" element={<BookingRefundAdmin />} />
        <Route path="booking/histories" element={<BookingHistoryAdmin />} />
        <Route path="logout" element={<LogoutAdmin />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
