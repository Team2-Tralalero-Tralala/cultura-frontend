import React from "react";
import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSam from "../../Components/NavbarSam";

const SuperAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* ส่วนเนื้อหา */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarSam />

        {/* เนื้อหาหลัก */}
        <main className="flex-1 overflow-y-auto p-0 m-0">
          <div className="pl-0 pr-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
