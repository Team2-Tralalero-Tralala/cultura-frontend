/**
 * Component: MemberLayout
 * คำอธิบาย:
 * Layout หลักของผู้ใช้งานระดับสมาชิก (Member)
 * ใช้เพื่อแสดง SidebarMember ทางซ้าย และพื้นที่สำหรับเนื้อหาที่เปลี่ยนตาม Route ทางขวา
 * หน้าที่:
 * - แสดง Sidebar สำหรับเมนูต่างๆ ของสมาชิก
 * - ใช้ <Outlet /> เพื่อแสดงคอนเทนต์จาก route ย่อย
 */
import React from 'react';
import SidebarMember from '../../Components/SidebarMember';
import NavbarMember from "../../Components/NavbarSam";
import { Outlet } from 'react-router-dom';
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

export default function MemberLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarMember />

      {/* 🔹 พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarMember />

        {/* 🔸 พื้นที่เนื้อหา */}
        <main className="flex-1 overflow-auto bg-[#F0F0F0] pl-6 pr-6 py-6">
          <Outlet />
        </main>

        {/* ToastContainer สำหรับ popup แจ้งเตือน */}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </div>
  );
};

