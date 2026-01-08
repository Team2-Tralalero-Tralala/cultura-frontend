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
import SearchPage from "@/Pages/Tourist/SearchPage";
import DetailPackagePage from "@/Pages/Tourist/DetailPackagePage";
import EditProfileTourist from "@/Pages/Tourist/EditProfileTourist";
import StoreDetailPage from "@/Pages/Tourist/StoreDetailPage";
import HomestayDetailTourist from "@/Pages/Tourist/DetailHomestayTourist";
import ChangePassword from "./Pages/Tourist/ChangePassword";

import CommunityDetailUser from "./Pages/Tourist/CommunityDetailUser";
import { RegisterPage } from "./Pages/Tourist/RegisterPage";
import { DetailBookingHistory } from "./Pages/Tourist/DetailBookingHistory";
import { DashboardPage } from "./Pages/Tourist/DashboardPage";
import BookingHistoryTourist from "./Pages/Tourist/BookingHistoryTourist";
import { CreateFeedbackPage } from "./Pages/Tourist/CreateFeedbackPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tourist/packages" element={<PackagesPage />} />
        <Route path="/tourist/home" element={<Home />} />
        <Route path="/tourist/search" element={<SearchPage />} />
        <Route path="/guest/search" element={<SearchPage />} />
        <Route path="/tourist/package/:packageId" element={<DetailPackagePage />} />
        <Route path="/tourist/edit-profile" element={<EditProfileTourist />} />
        <Route
          path="/tourist/community/:communityId/detail/store/:storeId"
          element={<StoreDetailPage />}
        />
        <Route
          path="/tourist/community/:communityId/detail/homestay/:homestayId"
          element={<HomestayDetailTourist />}
        />
        <Route path="/tourist/change-password" element={<ChangePassword />} />
        <Route path="/tourist/community/:communityId/detail" element={<CommunityDetailUser />} />
        <Route path="/tourist/booking-history/detail" element={<DetailBookingHistory />} />
        <Route path="/tourist/dashboard" element={<DashboardPage />} />
        <Route path="/tourist/booking-histories" element={<BookingHistoryTourist />} />
        <Route
          path="/tourist/booking-history/:bookingId/feedback"
          element={<CreateFeedbackPage />}
        />

        <Route path="/guest/*">
          <Route path="login" element={<LoginTourist />} />
          <Route path="partner/login" element={<LoginAdmin />} />
          <Route path="community/:communityId/detail" element={<CommunityDetailUser />} />
          <Route path="signup" element={<RegisterPage />} />
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
