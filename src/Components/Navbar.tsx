/*
 * คำอธิบาย : Component สำหรับ navigation bar (Navbar) ของหน้าแรก
 * แสดงข้อมูลสถานะการล็อกอิน และมีส่วนประกอบหลัก ได้แก่
 * 1. แถบข้อมูลด้านบน (แสดงสถานะหน้าและสถานะการล็อกอิน)
 * 2. แถบนำทางหลัก (โลโก้, ช่องค้นหา, ปุ่มลงทะเบียน/เข้าสู่ระบบ หรือโปรไฟล์ผู้ใช้)
 */
import { useAuth } from "@/Libs/UseAuth";
import { Link } from "react-router-dom";

/*
 * คำอธิบาย : Component สำหรับแสดง navigation bar ที่ด้านบนของหน้า
 * โดยจะแสดงปุ่มลงทะเบียนและเข้าสู่ระบบเมื่อยังไม่ล็อกอิน
 * หรือแสดงโปรไฟล์ผู้ใช้เมื่อล็อกอินแล้ว
 * Input : ไม่มี
 * Output : React Component ที่ render navigation bar
 */
export default function Navbar() {
  const { user } = useAuth();
  const isLoggedIn = user !== null;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Main Navigation Bar */}
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/logo-black.png" alt="Cultura Logo" className="h-8 w-auto" />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 relative">
          {/* <input
            type="text"
            placeholder="ค้นหาแพ็คเกจกิจกรรม:"
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-green focus:border-light-green"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-light-green hover:text-dark-green transition-colors"
            aria-label="ค้นหา"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button> */}
        </div>

        {/* Action Buttons / User Profile */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{user.username}</span>
              <div className="w-9 h-9 rounded-full bg-light-green flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              <Link to="/guest/register">
                <button
                  type="button"
                  className="px-6 py-1.5 border-2 border-gray-300 rounded-full text-base text-black hover:border-gray-400 transition-colors"
                >
                  ลงทะเบียน
                </button>
              </Link>
              <Link to="/guest/login">
                <button
                  type="button"
                  className="px-6 py-1.5 bg-light-green hover:bg-emerald-500 rounded-full text-white text-base font-medium transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
