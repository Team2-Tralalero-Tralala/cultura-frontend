import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSuperAdmin from "../../Components/NavbarSam";

export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">

        {/* Navbar ด้านบน */}
        <NavbarSuperAdmin />

        {/* เนื้อหาหลัก */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="pl-0 pr-6 h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


