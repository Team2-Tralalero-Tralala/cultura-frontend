import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BookingHistoryMember from "@/Pages/Member/BookingHistoryMember";

{
  /* import ของตัวเอง ข้างล่างเป็นตัวอย่าง*/
}
//import CommunityMember from '../../Pages/Member/CommunityMember';

const MemberRoutes: React.FC = () => {
  return (
    <Routes>
     <Route path="booking-histories/done" element={<BookingHistoryMember />} />
    </Routes>
  );
};

export default MemberRoutes;