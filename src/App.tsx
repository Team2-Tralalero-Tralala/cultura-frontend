/**
 * App หลักของระบบ
 * - ตั้งค่า Route สำหรับหน้า Booking Histories ของ Member เท่านั้น
 * - ระบบ auto-login แบบ Dev Mode (เฉพาะตอน import.meta.env.DEV)
 */

import { Routes, Route } from "react-router-dom";

// Layouts / Pages
import MemberLayout from "./Layouts/MemberLayout";
import BookingHistories from "./Pages/Member/BookingHistoryMember";

// Dev helper
import { memberLogin } from "./Libs/dev-login";

if (import.meta.env.DEV) {
  memberLogin();
}

export default function App() {
  return (
    <Routes>
      {/* ================= member ================= */}
      <Route path="/member" element={<MemberLayout />}>
        {/* ใช้รูปแบบ /member/booking/histories */}
        <Route path="booking/done" element={<BookingHistories />} />
      </Route>
    </Routes>
  );
}
