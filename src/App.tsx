import SuperAdminLayout from "@/Layouts/SuperAdmin/SuperAdminLayout";
import SuperAdminRoutes from "@/Layouts/SuperAdmin/SuperAdminRoutes";
import { Route, Routes } from "react-router";

import AdminLayout from "@/Layouts/Admin/AdminLayout";
import AdminRoutes from "@/Layouts/Admin/AdminRoutes";

import MemberLayout from "@/Layouts/Member/MemberLayout";
import MemberRoutes from "@/Layouts/Member/MemberRoutes";

import ProtectedRoute from "@/Libs/ProtectedRoute";
import Home from "@/Pages/Home";
import LoginAdmin from "@/Pages/LoginAdmin";
import LoginTourist from "@/Pages/LoginTourist";
import PackagesPage from "@/Pages/Tourist/PackagesPage";
import HomestayDetailTourist from "@/Pages/Tourist/DetailHomestayTourist";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tourist/packages" element={<PackagesPage />} />
        <Route path="/tourist/home" element={<Home />} />
        <Route path="/tourist/community/:communityId/detail/homestay/:homestayId" element={<HomestayDetailTourist />} />


        <Route path="/guest/*">
          <Route path="login" element={<LoginTourist />} />
          <Route path="partner/login" element={<LoginAdmin />} />
          <Route path="community/:communityId/detail/homestay/:homestayId" element={<HomestayDetailTourist />} />
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
    </>
  );
}

export default App;
