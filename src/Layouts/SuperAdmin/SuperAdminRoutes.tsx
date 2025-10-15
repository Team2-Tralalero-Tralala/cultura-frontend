import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import ManagePackagePage from "@/Pages/SuperAdmin/ManagePackagePage";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}
//import CommunityManagement from '../../Pages/SuperAdmin/ManageCommunity';

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="community/create" element={<CreateCommuninityPage />} />
      <Route path="community/edit/:communityId" element={<EditCommunity />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
