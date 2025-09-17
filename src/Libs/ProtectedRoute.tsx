import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "./AuthProviders";
import { useAuth } from "./useAuth";

type Props = {
  allow: Role[]; // role ที่เข้าได้
  redirectTo?: string; // หน้าเด้งไปเมื่อไม่มีสิทธิ์
};

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
