import React from "react";
import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSam from "../../Components/NavbarSam"; 

const SuperAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🔹 Sidebar ฝั่งซ้าย */}
      <SidebarSuperAdmin />

      {/* 🔹 ส่วนขวา: Navbar + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ✅ Navbar ด้านบน */}
        <NavbarSam />

        {/* ✅ เนื้อหาหลักของหน้า */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

