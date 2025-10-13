/*
 * คำอธิบาย : Component สำหรับ redirect ผู้ใช้ไปยังหน้าแรกที่ตรงกับ role ของตน
 * ใช้หลังจากเข้าสู่ระบบ เพื่อให้ระบบส่งผู้ใช้ไปยัง dashboard หรือ home page ที่ถูกต้อง
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
/*
 * ฟังก์ชัน : RoleRedirect
 * คำอธิบาย : ตรวจสอบ role ของผู้ใช้แล้ว redirect ไปยัง path ที่กำหนด
 * Input : -
 * Output :
 *   - superadmin → /superadmin/home
 *   - admin      → /admin/home
 *   - member     → /member/home
 *   - tourist    → /home
 *   - default    → /
 *   - ถ้าไม่มี user → /login
 */
export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="guest/login" replace />;

  switch (user.role) {
    case "superadmin":
      return <Navigate to="/super/home" replace />;
    case "admin":
      return <Navigate to="/admin/home" replace />;
    case "member":
      return <Navigate to="/member/home" replace />;
    case "tourist":
      return <Navigate to="/tourist/home" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
