/*
 * คำอธิบาย : Component สำหรับป้องกันเส้นทาง (Protected Route)
 * ใช้ร่วมกับ react-router-dom เพื่อกำหนดสิทธิ์การเข้าถึงของผู้ใช้ตาม role
 * ถ้าไม่มีสิทธิ์จะถูก redirect ไปยังหน้าที่กำหนด
 */
import { Navigate, Outlet, useLocation } from "react-router";
import type { Role } from "./AuthProvider";
import { useAuth } from "./UseAuth";

type Props = {
  allow: Role[]; // role ที่เข้าได้
  redirectTo?: string; // หน้าเด้งไปเมื่อไม่มีสิทธิ์
};

/*
 * ฟังก์ชัน : ProtectedRoute
 * คำอธิบาย : ตรวจสอบสิทธิ์ของผู้ใช้ก่อน render เส้นทาง
 * Input : Props (allow, redirectTo)
 * Output :
 *   - ถ้า user == null → redirect ไปหน้า redirectTo โดยส่ง state.from (หน้าเดิม)
 *   - ถ้า user.role อยู่ใน allow → แสดง <Outlet /> หรือ children
 *   - ถ้า user.role ไม่อยู่ใน allow → redirect ไปหน้า redirectTo
 */
export default function ProtectedRoute({
  allow,
  redirectTo = "/guest/login",
  children,
}: React.PropsWithChildren<Props>) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ⚠️ login แล้วแต่ role ไม่ตรง → redirect ตาม role
  if (!allow.includes(user.role)) {
    const roleRedirect =
      user.role === "admin" || user.role === "superadmin" || user.role === "member"
        ? "/guest/partner/login"
        : "/login";
    return <Navigate to={roleRedirect} replace />;
  }

  // ✅ ผ่านเงื่อนไข → render children หรือ Outlet (กรณี nested routes)
  return children ? <>{children}</> : <Outlet />;
}
