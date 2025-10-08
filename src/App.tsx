import { Route, Routes, Navigate } from "react-router";
import SidebarSuperAdmin from "./Components/SidebarSuperAdmin.tsx";
import SidebarAdmin from "./Components/SidebarAdmin";
import SidebarMember from "./Components/SidebarMember";

//super admin
import CommunityManagement from "./Pages/SuperAdmin/ManageCommunity.tsx";
import ManageAccount from "./Pages/SuperAdmin/ManageUser.tsx";
import BlockAccount from "./Pages/SuperAdmin/BlockUser.tsx";
import ManagePackage from "./Pages/SuperAdmin/ManagePackageSuperAdmin.tsx";
import ApprovePackage from "./Pages/SuperAdmin/ApprovePackage.tsx";
import ManageTag from "./Pages/SuperAdmin/ManageTag.tsx";
import Report from "./Pages/SuperAdmin/DashboardSuperAdmin.tsx";
import Log from "./Pages/SuperAdmin/LogSuperAdmin.tsx";
import Setting from "./Pages/SuperAdmin/Setting.tsx";
import LogoutSuperAdmin from "./Pages/SuperAdmin/LogoutSuperAdmin.tsx";

//admin
import ManageCommunity from "./Pages/Admin/ManageCommunityAdmin.tsx";
import ManageCommunityStore from "./Pages/Admin/ManageCommunityStoreAdmin.tsx";
import ManageCommunityHomestay from "./Pages/Admin/ManageCommunityHomestayAdmin.tsx";
import ManageMember from "./Pages/Admin/ManageMember.tsx";
import BlockMember from "./Pages/Admin/BlockMember.tsx";
import ManagePackageAdmin from "./Pages/Admin/ManagePackageAdmin.tsx";
import PackageRequestAdmin from "./Pages/Admin/PackageRequestAdmin.tsx";
import PackageHistoryAdmin from "./Pages/Admin/PackageHistoryAdmin.tsx";
import PackageFeedbackAdmin from "./Pages/Admin/PackageFeedbackAdmin.tsx";
import PackageDraftAdmin from "./Pages/Admin/PackageDraftAdmin.tsx";
import ManageBookingAdmin from "./Pages/Admin/ManageBookingAdmin.tsx";
import BookingRefund from "./Pages/Admin/BookingRefundAdmin.tsx";
import BookingHistory from "./Pages/Admin/BookingHistoryAdmin.tsx";
import DashboardAdmin from "./Pages/Admin/DashboardAdmin.tsx";
import LogAdmin from "./Pages/Admin/LogAdmin.tsx";
import LogoutAdmin from "./Pages/Admin/LogoutAdmin.tsx";

//member
import CommunityMember from "./Pages/Member/CommunityMember.tsx";
import ManagePackageMember from "./Pages/Member/ManagePackageMember.tsx";
import PackageDraftMember from "./Pages/Member/PackageDraftMember.tsx";
import PackageHistoryMember from "./Pages/Member/PackageHistoryMember.tsx";
import PackageReviewMember from "./Pages/Member/PackageReviewMember.tsx";
import ManageBookingMember from "./Pages/Member/ManageBookingMember.tsx";
import BookingRefundMember from "./Pages/Member/BookingRefundMember.tsx";
import BookingHistoryMember from "./Pages/Member/BookingHistoryMember.tsx";
import DashboardMember from "./Pages/Member/DashboardMember.tsx";
import LogoutMember from "./Pages/Member/LogoutMember.tsx";

function SidebarForSuperAdmin() {
  return (
    <div className="flex h-screen">
      <SidebarSuperAdmin />
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/communities" element={<CommunityManagement />} />
          <Route path="/users" element={<ManageAccount />} />
          <Route path="/user/blocked" element={<BlockAccount />} />
          <Route path="/packages" element={<ManagePackage />} />
          <Route path="/package-requests" element={<ApprovePackage />} />
          <Route path="/tags" element={<ManageTag />} />
          <Route path="/dashboard" element={<Report />} />
          <Route path="/logs" element={<Log />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/logout" element={<LogoutSuperAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function SidebarForAdmin() {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/communities" element={<ManageCommunity />} />
          <Route path="/community/stores" element={<ManageCommunityStore />} />
          <Route path="/community/homestays" element={<ManageCommunityHomestay />} />
          <Route path="/members" element={<ManageMember />} />
          <Route path="/member/status" element={<BlockMember />} />
          <Route path="/packages" element={<ManagePackageAdmin />} />
          <Route path="/package/requests" element={<PackageRequestAdmin />} />
          <Route path="/package/draft" element={<PackageDraftAdmin />} />
          <Route path="/package/histories" element={<PackageHistoryAdmin />} />
          <Route path="/package/feedbacks" element={<PackageFeedbackAdmin />} />
          <Route path="/booking" element={<ManageBookingAdmin />} />
          <Route path="/booking/refunds" element={<BookingRefund />} />
          <Route path="/booking/histories" element={<BookingHistory />} />
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/logs" element={<LogAdmin />} />
          <Route path="/logout" element={<LogoutAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </div>
    </div>
  );
}

function SidebarForMember() {
  return (
    <div className="flex h-screen">
      <SidebarMember />
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
        <Route path="/communities" element={<CommunityMember />} />
          <Route path="/packages" element={<ManagePackageMember />} />
          <Route path="/package/draft" element={<PackageDraftMember />} />
          <Route path="/package/done" element={<PackageHistoryMember />} />
          <Route path="/package/reviews" element={<PackageReviewMember />} />
          <Route path="/bookings" element={<ManageBookingMember />} />
          <Route path="/booking/refunds" element={<BookingRefundMember />} />
          <Route path="/booking/histories" element={<BookingHistoryMember />} />
          <Route path="/dashboard" element={<DashboardMember />} />
          <Route path="/logout" element={<LogoutMember />} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </div>
  );
}


export default SidebarForAdmin;
