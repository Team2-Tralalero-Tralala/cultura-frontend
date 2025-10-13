import CreateCommuninityPage from "@/Page/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Page/SuperAdmin/EditCommunityPage";
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
    </Routes>
  );
};

export default SuperAdminRoutes;
