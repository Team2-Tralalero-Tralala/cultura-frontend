import React from "react";
import SidebarSuperAdmin from "@/Components/SidebarSuperAdmin";
import NavbarSuperAdmin from "@/Components/NavbarSam"; // ✅ import Navbar
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar ด้านซ้าย */}
      <SidebarSuperAdmin />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarSuperAdmin />

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 p-8 overflow-auto bg-[#F0F0F0]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
