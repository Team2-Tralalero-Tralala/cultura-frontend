/*
 * ProtectedRoute — กันเส้นทางตาม role
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/Libs/AuthProvider";   // ✅ ใช้ alias ให้ชัด
import { useAuth } from "@/Libs/useAuth";          // ✅ ใช้ alias ให้ชัด

type Props = {
  allow: Role[];            // role ที่เข้าได้ เช่น ["superadmin"]
  redirectTo?: string;      // หน้าเด้งเมื่อไม่มีสิทธิ์
};

export default function ProtectedRoute({
  allow,
  redirectTo = "/guest/partner/login",            // ✅ ปรับ default ให้ตรงกับระบบ
}: Props) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    // เก็บ state.from ไว้เผื่ออนาคตอยากเด้งกลับหลังล็อกอิน
    return <Navigate to={redirectTo} state={{ from: loc }} replace />;
  }

  return allow.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} replace />
  );
}
