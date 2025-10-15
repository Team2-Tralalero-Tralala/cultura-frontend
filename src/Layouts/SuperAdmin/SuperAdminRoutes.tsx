import CreateCommuninityPage from "@/Pages/SuperAdmin/CreateCommuninityPage";
import { EditCommunity } from "@/Pages/SuperAdmin/EditCommunityPage";
import UserStatusPage from "@/Pages/SuperAdmin/BlockUserPage";
import UserDetailPage from "@/Pages/SuperAdmin/UserDetailPage";
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
      <Route path="users/blocked" element={<UserStatusPage />} />
      <Route path="users/:id" element={<UserDetailPage />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
