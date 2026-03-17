/**
 * คำอธิบาย : Component สำหรับ Layout ของผู้ใช้งานระดับซูเปอร์แอดมิน (Super Admin)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าซูเปอร์แอดมินทั้งหมด
 */
import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/Sidebar/SidebarSuperAdmin";
import NavbarSuperAdmin from "../../Components/Navbar/NavbarSam";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Layout ของผู้ใช้กลุ่ม Super Admin
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Layout
 */
export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarSuperAdmin />

        {/* พื้นที่เนื้อหา */}
        <main className="flex-1 overflow-auto bg-[#F0F0F0] pl-6 pr-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
