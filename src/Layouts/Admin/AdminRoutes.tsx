import React from "react";
import { Routes, Route } from "react-router-dom";
import StoreDetailAdmin from "@/Pages/Admin/StoreDetailAdmin";
import BookingHistoryAdmin from "@/Pages/Admin/BookingHistoryAdmin";
import AuthentionLogSuperAdmin from "@/Pages/SuperAdmin/AuthentionLogSuperAdmin";
import PackageDraftAdmin from "@/Pages/Admin/PackageDraftAdmin";
{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="logs" element={<AuthentionLogSuperAdmin />} />
      <Route path="package/draft" element={<PackageDraftAdmin />} />
      <Route path="stores/:storeId" element={<StoreDetailAdmin />} />
    </Routes>
  );
};

export default AdminRoutes;
