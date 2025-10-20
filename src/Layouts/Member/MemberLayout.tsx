import React from "react";
import SidebarMember from "../../Components/SidebarMember";
import { Outlet } from "react-router-dom";
import NavbarSam from "@/Components/NavbarSam";

const MemberLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ด้านซ้าย */}
      {/* Sidebar ด้านซ้าย */}
      <SidebarMember />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarSam />

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 p-8 overflow-auto bg-[#F0F0F0]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;