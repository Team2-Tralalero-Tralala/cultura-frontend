/**
 * Component: AdminLayout
 * คำอธิบาย:
 * Layout หลักของผู้ดูแลระบบระดับวิสาหกิจชุมชน (Admin)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าผู้ดูแลทั้งหมด
 * หน้าที่:
 * - แสดง SidebarAdmin ทางด้านซ้าย
 * - ใช้ <Outlet /> เพื่อแสดงคอนเทนต์ของหน้าที่ตรงกับ Route
 */
import SidebarAdmin from '../../Components/SidebarAdmin';
import NavbarAdmin from "../../Components/NavbarSam";
import { Outlet } from 'react-router-dom';

export default function SuperAdminLayout() {
  return (
<div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">

        {/* Navbar ด้านบน */}
        <NavbarAdmin />

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

