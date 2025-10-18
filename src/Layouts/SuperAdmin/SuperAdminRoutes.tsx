import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import ManagePackagePage from "@/Pages/SuperAdmin/ManagePackagePage";
import EditPackagePage from "@/Pages/SuperAdmin/EditPackagePage";
import { Routes, Route } from "react-router-dom";
import ManageCommunitySuperAdmin from "@/Pages/SuperAdmin/ManageCommunitySuperAdmin";
import CommunityDetailSuperAdmin from "@/Pages/SuperAdmin/CommunityDetailSuperAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="community/edit/:communityId" element={<EditCommunity />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/edit/:id" element={<EditPackagePage />} />
      <Route path="communities" element={<ManageCommunitySuperAdmin />} />
      <Route
        path="community/detail/:id"
        element={<CommunityDetailSuperAdmin />}
      />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
    </Routes>
  );
}
