import { Outlet } from "react-router-dom";
import NavbarSam from "@/Components/NavbarSam";
import SidebarSuperAdmin from "@/Components/SidebarSuperAdmin";

export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/*ใส่ Navbar ตรงนี้ */}
        <NavbarSam />

        {/*แสดงเนื้อหาหน้าปัจจุบัน */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
