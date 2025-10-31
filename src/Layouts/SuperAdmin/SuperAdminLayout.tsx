import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSuperAdmin from "../../Components/NavbarSam";

/**
 * Layout หลักของ Super Admin
 * - แสดง Sidebar (เมนูซ้าย)
 * - Navbar (ด้านบน)
 * - พื้นที่เนื้อหา (Outlet)
 * 
 */
export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* 🔹 พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarSuperAdmin />

        {/* เนื้อหาหลัก */}
        <main className="flex-1 overflow-y-auto p-0 m-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
