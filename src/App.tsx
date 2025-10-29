import SuperAdminLayout from "@/Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "@/Layouts/SuperAdmin/SuperAdminRoutes";
import { Route, Routes } from "react-router";

// Toastify สำหรับแจ้งเตือน
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import AdminRoutes from "@/Layouts/Admin/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MemberLayout from "@/Layouts/Member/MemberLayout";
import MemberRoutes from "@/Layouts/Member/MemberRoutes";

import { AuthProvider } from "@/Libs/AuthProvider";
import ProtectedRoute from "@/Libs/ProtectedRoute";
import LoginAdmin from "@/Pages/LoginAdmin";
import LoginTourist from "@/Pages/LoginTourist";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/guest/*">
          <Route path="login" element={<LoginTourist />} />
          <Route path="partner/login" element={<LoginAdmin />} />
        </Route>

        <Route
          path="/super/*"
          element={<SuperAdminLayout />}>
          <Route path="*" element={<SuperAdminRoutes />} />
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
    </AuthProvider>
  );
}

export default App;
