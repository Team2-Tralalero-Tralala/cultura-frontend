import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "superadmin":
      return <Navigate to="/superadmin/home" replace />;
    case "admin":
      return <Navigate to="/admin/home" replace />;
    case "member":
      return <Navigate to="/member/home" replace />;
    case "tourist":
      return <Navigate to="/home" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
