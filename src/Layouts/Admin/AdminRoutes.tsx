import React from "react";
import { Routes, Route } from "react-router-dom";
import BookingHistoryAdmin from "@/Pages/Admin/BookingHistoryAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";
import ManageHomestayAdmin from "@/Pages/Admin/ManageHomestayAdmin";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="community/:communityId/homestays/all" element={<ManageHomestayAdmin />}
/>
    </Routes>
    
  );
};



export default AdminRoutes;
