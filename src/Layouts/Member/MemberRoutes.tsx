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
      <Route path="/packages/all" element={<ManagePackagePage />} />
    </Routes>
  );
};

export default MemberRoutes;
