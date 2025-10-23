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
import { Outlet } from 'react-router-dom';

const MemberLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ด้านซ้าย */}
      <SidebarMember />

      <div className="flex flex-col flex-1 h-full">

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 p-8 overflow-auto bg-[#F0F0F0]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;