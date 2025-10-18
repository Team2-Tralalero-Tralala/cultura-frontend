/*
 * คำอธิบาย : Component สำหรับ Layout ของหน้า Authentication (เช่น Login, Register)
 * โดยจัดโครงร่างพื้นฐาน เช่น พื้นหลัง, โลโก้, ปุ่มสมัครสมาชิก และการ์ดเข้าสู่ระบบ
 */

type AuthLayoutProps = {
  children: React.ReactNode;
  rightLabel: string;
  rightButton: React.ReactNode;
  color: string;
  logo: string;
};

/*
 * ฟังก์ชัน : AuthLayout
 * คำอธิบาย : ฟังก์ชัน Component สำหรับสร้าง Layout หน้า Authentication
 * Input :
 *   - children (ReactNode) : เนื้อหาที่จะเรนเดอร์ภายใน Layout (เช่นฟอร์ม Login)
 *   - rightLabel (string) : ข้อความที่จะแสดงด้านบนขวา (เช่น "ยังไม่มีบัญชี?")
 *   - rightButton (ReactNode) : ปุ่มหรือ element ที่จะแสดงถัดจากข้อความด้านบนขวา
 *   - color (string) : สีหลักของ Layout ("tourist" หรือ "admin")
 *   - logo (string) : path หรือ URL ของโลโก้ที่จะใช้แสดง
 * Output :
 *   - React component ที่ใช้เป็น Layout ของหน้าที่เกี่ยวกับ Authentication
 */

export default function AuthLayout({
  children,
  rightLabel,
  rightButton,
  color,
  logo,
}: AuthLayoutProps) {
  /*
   * ฟังก์ชัน : getBgColor
   * คำอธิบาย : คืนค่า className สีพื้นหลังตาม role
   * Input : color (string) - "tourist" หรือ "admin"
   * Output : className ของ TailwindCSS
   */
  function getBgColor() {
    switch (color) {
      case "tourist":
        return "bg-tourist-auth";
      case "admin":
      default:
        return "bg-dark-green";
    }
  }
  function getRingColor() {
    switch (color) {
      case "tourist":
        return "ring-tourist-auth";
      case "admin":
      default:
        return "ring-dark-green";
    }
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* มุมบนซ้าย */}
      <div
        className={`
    absolute top-0 left-0 w-64 h-64 
    ${getBgColor()} 
    rounded-br-full 
    ring-1 ring-offset-8 ${getRingColor()} 
  `}
      ></div>

      <div className="absolute top-10 left-10 flex items-center">
        <img src={logo} alt="Cultura Logo" className="w-40 top-8 right-8" />
      </div>
      {/* มุมล่างขวา */}
      <div
        className={`absolute bottom-0 right-0 w-64 h-64 ${getBgColor()} rounded-tl-full ring-1 ring-offset-8 ${getRingColor()} `}
      ></div>
      {/* ปุ่มสมัครสมาชิก */}
      <div className="absolute top-10 right-10 flex items-center gap-10">
        <div className="text-gray-800 text-base">{rightLabel}</div>
        {rightButton}
      </div>

      {/* การ์ดเข้าสู่ระบบ */}
      <div className="relative">{children}</div>
    </div>
  );
}
