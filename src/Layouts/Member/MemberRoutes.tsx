import CreatePackagePage from "@/Pages/Member/CreatePackagePage";
import ManagePackagePage from "@/Pages/Member/ManagePackagePage";
import EditPackagePage from "@/Pages/Member/EditPackagePage";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}
//import CommunityMember from '../../Pages/Member/CommunityMember';

const MemberRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 
      <Route path="community" element={<CommunityMember />} />
  */}
      <Route path="package/create" element={<CreatePackagePage />} />
      <Route path="packages/all" element={<ManagePackagePage />} />
      <Route path="package/edit/:id" element={<EditPackagePage />} />
    </Routes>
  );
};

export default MemberRoutes;