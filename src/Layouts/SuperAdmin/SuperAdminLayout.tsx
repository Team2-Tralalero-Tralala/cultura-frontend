/**
 * Component: SuperAdminLayout
 * คำอธิบาย:
 * Layout หลักของระบบผู้ดูแลระดับสูง (Super Admin)
 * ใช้สำหรับแสดง Sidebar ด้านซ้าย และพื้นที่เนื้อหา (Outlet) ด้านขวา
 * หน้าที่หลัก:
 * - ครอบเส้นทางทั้งหมดที่อยู่ในหมวด Super Admin
 * - ใช้ <SidebarSuperAdmin /> เป็นเมนูด้านข้าง
 * - ใช้ <Outlet /> เพื่อแสดงเนื้อหาตาม Route ที่ถูกเลือก
 */
import React from 'react';
import SidebarSuperAdmin from '../../Components/SidebarSuperAdmin';
import { Outlet } from 'react-router-dom';

export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar ด้านซ้าย */}
      <SidebarSuperAdmin />

      <div className="flex flex-col flex-1 h-full">

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 p-8 overflow-auto bg-[#F0F0F0]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
