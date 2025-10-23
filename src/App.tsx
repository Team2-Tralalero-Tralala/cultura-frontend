import { Route, Routes } from "react-router";
import SuperAdminLayout from "@/Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "@/Layouts/SuperAdmin/SuperAdminRoutes";

// Toastify สำหรับแจ้งเตือน
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import AdminRoutes from "@/Layouts/Admin/AdminRoutes";

import MemberLayout from "@/Layouts/Member/MemberLayout";
import MemberRoutes from "@/Layouts/Member/MemberRoutes";

import ProtectedRoute from "@/Libs/ProtectedRoute";
import LoginTourist from "@/Pages/LoginTourist";
import LoginAdmin from "@/Pages/LoginAdmin";

function App() {
  const [sort, setSort] = useState<SortValue>("latest");

  return (
    <>
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

      {/* Toastify */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}

export default App;
