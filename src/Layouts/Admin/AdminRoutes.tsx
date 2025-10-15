import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookingHistoryAdmin from '@/Pages/Member/BookingHistoryMember';
{/* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/}

//import ManageCommunityAdmin from '../../Pages/Admin/ManageCommunityAdmin';



 
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="booking-histories/done" element={<BookingHistoryAdmin />} />
    </Routes>
    
  );
};

export default AdminRoutes;