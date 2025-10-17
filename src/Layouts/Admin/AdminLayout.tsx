/**
 * Component: AdminLayout
 * คำอธิบาย:
 * Layout หลักของผู้ดูแลระบบระดับวิสาหกิจชุมชน (Admin)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าผู้ดูแลทั้งหมด
 * หน้าที่:
 * - แสดง SidebarAdmin ทางด้านซ้าย
 * - ใช้ <Outlet /> เพื่อแสดงคอนเทนต์ของหน้าที่ตรงกับ Route
 */
import React from 'react';
import SidebarAdmin from '../../Components/SidebarAdmin';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
<div className="flex h-screen">
      {/* Sidebar ด้านซ้าย */}
      <SidebarAdmin />

      <div className="flex flex-col flex-1 h-full">

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 p-8 overflow-auto bg-[#F0F0F0]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
