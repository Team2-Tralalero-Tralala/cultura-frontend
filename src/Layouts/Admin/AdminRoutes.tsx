import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BookingHistoryAdmin from "@/Pages/Admin/BookingHistoryAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
    </Routes>
  );
};

export default AdminRoutes;
