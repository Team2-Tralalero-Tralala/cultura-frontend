import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookingHistoryAdmin from '@/Pages/Admin/BookingHistoryAdmin';
import CommunityDetailAdmin from "@/Pages/Admin/CommunityDetailAdmin";
{/* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';


const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
      <Route path="community" element={<CommunityDetailAdmin />} />
    </Routes>
    
  );
};

export default AdminRoutes;