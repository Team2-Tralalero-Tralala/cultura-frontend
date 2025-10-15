import { Route, Routes } from "react-router";
import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "./Layouts/SuperAdmin/SuperAdminRoutes";

import AdminLayout from "./Layouts/Admin/AdminLayout";
import AdminRoutes from "./Layouts/Admin/AdminRoutes";

import MemberLayout from "./Layouts/Member/MemberLayout";
import MemberRoutes from "./Layouts/Member/MemberRoutes";

import ProtectedRoute from "./Libs/ProtectedRoute";
import LoginTourist from "./Pages/LoginTourist";
import LoginAdmin from "./Pages/LoginAdmin";

function App() {
  const [query, setQuery] = useState("");

  const searchBar = (value: string) => {
    console.log("ค้นหาแพ็กเกจกิจกรรม:", value);
  };

  return (
    <Routes>
      <Route path="/guest/*">
        <Route path="login" element={<LoginTourist />} />
        <Route path="partner/login" element={<LoginAdmin />} />
      </Route>

      <Route
        path="/super/*"
        element={
          <ProtectedRoute allow={["superadmin"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<SuperAdminRoutes />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allow={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* เส้นทางภายใน /super/ ทั้งหมด */}
        <Route path="*" element={<AdminRoutes />} />
      </Route>
      <Route
        path="/member/*"
        element={
          <ProtectedRoute allow={["member"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<MemberRoutes />} />
      </Route>

      {/* fallback */}
    </Routes>
  );
}

export default App;
