import { Route, Routes, Navigate } from "react-router";
import SidebarSuperAdmin from "./Components/SidebarSuperAdmin.tsx";
import SidebarAdmin from "./Components/SidebarAdmin";
import SidebarMember from "./Components/SidebarMember";
import NavbarTourist from "./Components/NavbarTourist"
import  NavbarSam  from "./Components/NavbarSam"
import DataTable, { type Column, type DataTableProps } from "./Components/Tables/Index";
import { TrashIcon, BanIcon } from "./Components/Tables/Icon"; 
import { useMemo } from "react";

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
  )};
/*
* คำอธิบาย : ตัวอย่างการใช้งาน DataTable สำหรับแสดงรายการผู้ใช้
* กำหนดคอลัมน์ ปุ่มจัดการต่อแถว (edit/block/unblock/delete)
* และปุ่มดำเนินการแบบกลุ่ม (bulk delete / bulk unblock) พร้อมข้อมูลจำลอง
*/


function SidebarForAdmin() {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <div className="flex-1 overflow-auto bg-gray-100">
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


// Removed the misplaced export statement


function nav_tourist() {
  return (
    <>
      <NavbarTourist />
      
    </>
  )
}

function nav_sam() {
  return (
    <>
      <NavbarSam />
    </>
  
  )
}


/*
* คำอธิบาย : ตัวอย่างการใช้งาน DataTable สำหรับแสดงรายการผู้ใช้
* กำหนดคอลัมน์ ปุ่มจัดการต่อแถว (edit/block/unblock/delete)
* และปุ่มดำเนินการแบบกลุ่ม (bulk delete / bulk unblock) พร้อมข้อมูลจำลอง
*/
function App() {
  type Row = { id: number; name: string; role: string; community: string; email: string; suspended?: boolean; };

  const columns: Column<Row>[] = [
    { key: "name", header: "ชื่อ" },
    { key: "role", header: "ประเภท" },
    { key: "community", header: "ชุมชน" },
    { key: "email", header: "อีเมล" },
    
  ];

  const actions: NonNullable<DataTableProps<Row>["actions"]> = {
    header: "จัดการ",
    align: "right",
    width: "200px",
    variant: "icons",
    className: "pr-10",
    items: (r) => ["edit", r.suspended ? "unblock" : "block", "delete"],
    // callbacks: {
    //   edit:    (r) => console.log("edit", r.id),
    //   block:   (r) => console.log("block", r.id),
    //   unblock: (r) => console.log("unblock", r.id),
    //   delete:  (r) => console.log("delete", r.id),
    // },
  };


  const bulkActions: NonNullable<DataTableProps<Row>["bulkActions"]> = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      onClick: async (rows) => {
        const ids = rows.map(r => r.id);
        console.log("bulk delete ids:", ids);
        // ตัวอย่างเชื่อม backend:
        // await fetch("/api/users/bulk-delete", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids }) });
      
      },   
    },
    {
    id: "bulk-unblock",
    label: "ยกเลิกการระงับทั้งหมด",
    icon: BanIcon,
    intent: "neutral", 
    onClick: async (rows) => {
      const ids = rows.map(r => r.id);
      console.log("bulk unblock ids:", ids);
    },
  },
    
  ];

  const rows = useMemo<Row[]>(
    () => Array.from({ length: 111 }, (_, i) => ({
      id: i + 1,
      name: `ผู้ใช้ ${i + 1}`,
      role: i % 3 === 0 ? "ผู้ดูแลระบบ" : "สมาชิก",
      community: ["บ้านแว้ว", "คลองสระบัว", "สามช่อง"][i % 3],
      email: `user${i + 1}@ex.com`,
      suspended: i % 7 === 0,
    })), []
  );

  return (
    <DataTable<Row>
      data={rows}
      columns={columns}
      getRowKey={(r) => r.id}
      actions={actions}
      bulkActions={bulkActions}      
      pageSizeOptions={[10, 30, 50]}
      defaultPageSize={10}
      theme="brand"
    />
  );
}
export default SidebarForAdmin;

