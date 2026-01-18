/*
 * คำอธิบาย : Component สำหรับ navigation bar (Navbar) มีปุ่มโปรไฟล์และเมนู dropdown ของ ผู้ใช้ทั่วไป (Tourist)
 * โดยมีการแสดงเมนูต่าง ๆ ใน dropdown ได้แก่ แก้ไขข้อมูลส่วนตัว, ประวัติการจอง, เปลี่ยนรหัสผ่าน, ดูรายงาน และออกจากระบบ
 */
import { useAuth } from "@/Libs/useAuth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./Search/SearchBar";
import { Icon } from "@iconify/react";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Navbar ของผู้ใช้กลุ่ม Tourist
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Navbar
 */
const NavbarTourist = () => {
  const { user, logout: logoutAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับเข้าสู่ระบบ
   * Input : ไม่มี
   * Output : void
   */
  const login = () => {
    navigate("/guest/login");
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับออกจากระบบโดยเรียกใช้ logout จาก AuthContext และปิด dropdown
   * Input : ไม่มี
   * Output : void
   */
  const logout = async () => {
    await logoutAuth();
    setIsOpen(false);
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับสลับสถานะการเปิด-ปิด dropdown
   * Input : ไม่มี
   * Output : void
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto flex items-center justify-between px-6 h-16 lg:gap-6">
        <div className="flex items-center gap-10">
          <a href="/">
            <img
              src={"/public/logo-black.png"}
              className="w-40.25 h-7.93"
              alt="Cultura logo"
            />
          </a>

          {/* กล่องค้นหา */}
          <SearchBar
            onSearch={(text) => {
              if (text.trim()) {
                navigate(`/tourist/search?q=${encodeURIComponent(text)}`);
              }
            }}
            placeholder="ค้นหาแพ็กเกจกิจกรรม:"
          />
        </div>

        <div className="ml-auto flex flex-col items-center gap-6 lg:flex-row lg:gap-6">
          {user && user.role === "tourist" ? (
            <div className="relative">
              {/* ปุ่มโปรไฟล์ */}
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between gap-3 hover:text-green-500 p-2"
              >
                {user.fname} {user.lname}
                <img
                  src={user.profile_picture || "/profile.png"}
                  className="w-9 h-9 rounded-full object-cover"
                  alt="Profile"
                />
              </button>

              {/* Dropdown แสดงเมื่อคลิก */}
              {isOpen && (
                <ul className="absolute bg-white rounded-lg w-max shadow-md mt-2 z-10">
                  <li className="block w-max hover:text-green-500 py-2 px-3 cursor-pointer">
                    <Link to="/tourist/edit-profile" className="flex items-center gap-2">
                      <Icon icon="material-symbols:edit-outline" className="text-xl" />
                      แก้ไขข้อมูลส่วนตัว
                    </Link>
                  </li>

                  <li className="block w-max hover:text-green-500 py-2 px-3 cursor-pointer">
                    <Link to="/tourist/booking-histories" className="flex items-center gap-2">
                      <Icon icon="material-symbols:history-rounded" className="text-xl" />
                      ประวัติการจอง
                    </Link>
                  </li>
                  <li
                    className="flex items-center gap-2 block w-max hover:text-green-500 py-2 px-3 cursor-pointer"
                    onClick={() => navigate("/tourist/change-password")}
                  >
                    <Icon icon="material-symbols:lock" className="text-xl" />
                    เปลี่ยนรหัสผ่าน
                  </li>

                  <li className="block w-max hover:text-green-500 py-2 px-3 cursor-pointer">
                    <Link to="/tourist/dashboard" className="flex items-center gap-2">
                      <Icon icon="material-symbols:team-dashboard-outline" className="text-xl" />
                      ดูรายงาน
                    </Link>
                  </li>

                  <li
                    onClick={logout}
                    className="flex items-center gap-2 w-max hover:text-green-500 py-2 px-3 cursor-pointer"
                  >
                    <Icon icon="majesticons:logout-line" className="text-xl" />
                    ออกจากระบบ
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <button className="border-2 px-6 py-1 rounded-full hover:text-green-500 text-base">
                <Link to="/guest/signup" className="flex items-center gap-2">
                  ลงทะเบียน
                </Link>
              </button>

              <button
                onClick={login}
                className="bg-[#00BF6A] px-6 py-1.5 rounded-full border-2 border-transparent hover:text-white text-base"
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavbarTourist;
