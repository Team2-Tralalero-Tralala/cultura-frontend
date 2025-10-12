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
      <Route path="community">
        <Route path="create" element={<CreateCommuninityPage />} />
        <Route path="edit/:communityId" element={<EditCommunity />} />
      </Route>
      {/* 
      <Route path="communities/all" element={<CommunityManagement />} />
      <Route path="accounts/all" element={<ManageAccount />} />
*/}
    </Routes>
  );
};

export default SuperAdminRoutes;
