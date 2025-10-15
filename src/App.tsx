import { Route, Routes, Navigate } from "react-router";
import RoleRedirect from "./Libs/RoleRedirect";

import LoginAdmin from "./Pages/LoginAdmin";
import LoginTourist from "./Pages/LoginTourist";
import SuperAdminLayout from "./Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "./Layouts/SuperAdmin/SuperAdminRoutes";

// Toastify สำหรับแจ้งเตือน
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/guest/login" element={<LoginTourist />} />
        <Route path="/guest/partner/login" element={<LoginAdmin />} />

        {/* Root redirect */}
        <Route index element={<RoleRedirect />} />

        {/* SuperAdmin layout */}
        <Route path="/super" element={<SuperAdminLayout />}>
          <Route path="account/*" element={<SuperAdminRoutes />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
