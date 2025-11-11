import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSuperAdmin from "../../Components/NavbarSam";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

/**
 * Layout หลักของ Super Admin
 * - แสดง Sidebar (เมนูซ้าย)
 * - Navbar (ด้านบน)
 * - พื้นที่เนื้อหา (Outlet)
 */
export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarSuperAdmin />

      {/* 🔹 พื้นที่หลัก */}
      <div className="flex flex-col flex-1 h-full">
        {/* Navbar ด้านบน */}
        <NavbarSuperAdmin />

        {/* 🔸 พื้นที่เนื้อหา */}
        <main className="flex-1 overflow-auto bg-[#F0F0F0] pl-4 pr-8 py-8">
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
