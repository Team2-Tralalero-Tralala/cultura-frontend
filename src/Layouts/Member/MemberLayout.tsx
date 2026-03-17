/**
 * คำอธิบาย : Component สำหรับ Layout ของผู้ใช้งานระดับสมาชิก (Member)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าสมาชิกทั้งหมด
 */
import React from "react";
import SidebarMember from "../../Components/Sidebar/SidebarMember";
import NavbarMember from "../../Components/Navbar/NavbarSam";
import { Outlet } from "react-router-dom";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Layout ของผู้ใช้กลุ่ม Member
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Layout
 */
export default function MemberLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarMember />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarMember />

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 overflow-auto bg-[#F0F0F0] pl-6 pr-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
