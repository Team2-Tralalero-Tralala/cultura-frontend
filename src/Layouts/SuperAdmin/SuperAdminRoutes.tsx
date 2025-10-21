import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import ManagePackagePage from "@/Pages/SuperAdmin/ManagePackagePage";
import EditPackagePage from "@/Pages/SuperAdmin/EditPackagePage";
import { Routes, Route } from "react-router-dom";
import ManageCommunitySuperAdmin from "@/Pages/SuperAdmin/ManageCommunitySuperAdmin";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/CommunityDetailSuperAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";
import { CreateStore } from "@/Pages/SuperAdmin/CreateStore";
import { EditStore } from "@/Pages/SuperAdmin/EditStore";
import ManageHomestaySuperAdmin from "@/Pages/SuperAdmin/ManageHomestaySuperAdmin";
import HomestayDetailPage from "@/Pages/SuperAdmin/DetailHomestayPage";

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/edit/:communityId" element={<EditCommunity />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/edit/:id" element={<EditPackagePage />} />
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      <Route path="community/:id" element={<CommunityDetailSuperAdmin />} />
      <Route
        path="/community/:communityId/store/create"
        element={<CreateStore />}
      />
      <Route path="/store/:storeId/edit" element={<EditStore />} />

      <Route
        path="community/:communityId/homestay/:homestayId"
        element={<HomestayDetailPage />}
      />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route
        path="community/:communityId/homestay/all"
        element={<ManageHomestaySuperAdmin />}
      />
    </Routes>
  );
}
