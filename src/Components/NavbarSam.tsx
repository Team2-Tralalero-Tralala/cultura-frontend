/*
 * คำอธิบาย : Component สำหรับ navigation bar (Navbar) มีปุ่มโปรไฟล์และเมนู dropdown ของ Super Admin, Admin และ Member
 * โดยมีการแสดงเมนูต่าง ๆ ใน dropdown ได้แก่ แก้ไขโปรไฟล์, เปลี่ยนรหัสผ่าน และออกจากระบบ
 */
import { AuthProvider, AuthContext } from "@/Libs/AuthProvider";
import { useContext, useState } from "react";
import imgUser from "/profile.png";
import { Link } from "react-router-dom";

const NavbarSam = () => {
  // State สำหรับจัดการการเปิด-ปิด dropdown
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  // ฟังก์ชันสลับสถานะการเปิด-ปิด dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const logOut = async () => {
    try {
      await logout(); // เรียก context logout (ล้าง token / session)
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const formatRole = (role?: string) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      default:
        return role;
    }
  };

  const closeDropdown = () => setIsOpen(false);

  return (
    <header className="bg-white">
      <nav className="flex items-center justify-between px-12 h-16">
        <div className="relative ml-auto">
          {/* ปุ่มโปรไฟล์ */}
          <button onClick={toggleDropdown} className="flex items-center justify-between gap-3 p-2">
            <img src={imgUser} className="w-9 h-9 rounded-full" />
            <span className="font-medium text-base max-w-[180px] truncate">
              {user?.fname} {user?.lname}
            </span>

          </button>

          {/* Dropdown */}
          {isOpen && (
            <ul className="absolute bg-white rounded-lg w-[320px] max-w-[90vw] shadow-md p-4 right-0 top-full mt-2 z-10 text-base-semibold">
              {/* แสดงข้อมูล profile */}
              <div className="flex items-center gap-3 mb-3">
                <img src={imgUser} className="w-10 h-10 rounded-full" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-medium truncate">
                      {user?.fname} {user?.lname}
                    </span>
                    <span className="border-blue-400 border-1.8 text-xs bg-blue-100 text-blue-500 font-bold px-2 py-0.5 rounded-md flex-shrink-0">
                      {formatRole(user?.role)}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm truncate">
                    {user?.email}
                  </span>

                </div>
              </div>

              <hr className="border-gray-200 my-2" />

              {/* เมนูใน dropdown */}
              <li>
                <Link
                  to={(() => {
                    switch (user?.role) {
                      case "superadmin":
                        return "/super/profile-me";
                      case "admin":
                        return "/admin/profile-me";
                      case "member":
                        return "/member/profile-me";
                      // ถ้ามี role อื่น เช่น tourist แล้วมีหน้าโปรไฟล์ ก็ใส่เพิ่มได้
                      // case "tourist":
                      //   return "/tourist/profile-me";
                      default:
                        return "#";
                    }
                  })()}
                  onClick={closeDropdown}
                  className="block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base-semibold"
                >
                  แก้ไขโปรไฟล์
                </Link>
              </li>

              <li>
                <Link
                  to={(() => {
                    switch (user?.role) {
                      case "superadmin":
                        return "/super/account/change-password/own";
                      case "admin":
                        return "/admin/account/change-password/own";
                      case "member":
                        return "/member/account/change-password/own";
                      default:
                        return "#";
                    }
                  })()}
                  onClick={closeDropdown}
                  className="block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base-semibold"
                >
                  เปลี่ยนรหัสผ่าน
                </Link>
              </li>
              <hr className="border-gray-200 my-2" />
              <li
                className="block py-2 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-base-semibold"
                onClick={logOut}
              >
                ออกจากระบบ
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavbarSam;
