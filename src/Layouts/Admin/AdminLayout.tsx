/**
 * คำอธิบาย : Component สำหรับ Layout ของผู้ดูแลระบบระดับวิสาหกิจชุมชน (Admin)
 * ใช้สำหรับแสดง Sidebar และพื้นที่คอนเทนต์ของหน้าผู้ดูแลทั้งหมด
 */
import SidebarAdmin from "../../Components/Sidebar/SidebarAdmin";
import NavbarAdmin from "../../Components/Navbar/NavbarSam";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Layout ของผู้ใช้กลุ่ม Admin
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Layout
 */
export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarAdmin />

        {/* พื้นที่เนื้อหา */}
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
}
