/*
 * คำอธิบาย : Component สำหรับป้องกันเส้นทาง (Protected Route)
 * ใช้ร่วมกับ react-router-dom เพื่อกำหนดสิทธิ์การเข้าถึงของผู้ใช้ตาม role
 * ถ้าไม่มีสิทธิ์จะถูก redirect ไปยังหน้าที่กำหนด
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "./AuthProviders";
import { useAuth } from "./useAuth";

type Props = {
  allow: Role[]; // role ที่เข้าได้
  redirectTo?: string; // หน้าเด้งไปเมื่อไม่มีสิทธิ์
};
/*
 * ฟังก์ชัน : ProtectedRoute
 * คำอธิบาย : ตรวจสอบสิทธิ์ของผู้ใช้ก่อน render เส้นทาง
 * Input : Props (allow, redirectTo)
 * Output :
 *   - ถ้า user == null → redirect ไปหน้า redirectTo
 *   - ถ้า user.role อยู่ใน allow → แสดง <Outlet />
 *   - ถ้า user.role ไม่อยู่ใน allow → redirect ไปหน้า redirectTo
 */
export default function ProtectedRoute({ allow, redirectTo = "/" }: Props) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: loc }} replace />;
  }
  return allow.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} replace />
  );
}
