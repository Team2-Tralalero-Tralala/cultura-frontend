/**
 * App หลักของระบบ
 * - ตั้งค่า Route สำหรับหน้า Booking Histories ของ Admin เท่านั้น
 * - ระบบ auto-login แบบ Dev Mode (เฉพาะตอน import.meta.env.DEV)
 */

import { Routes, Route } from "react-router-dom";

// Layouts / Pages
import AdminLayout from "./Layouts/AdminLayout";
import BookingHistories from "./Pages/Admin/BookingHistoryAdmin";

export default function App() {
  return (
    <Routes>
      {/* ================= Admin ================= */}
        <Route path="/admin" element={<AdminLayout />}>
        <Route path="booking/histories" element={<BookingHistories />} />
      </Route>
    </Routes>
  );
}
