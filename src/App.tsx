import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./Layouts/AdminLayout";

import ManagePackageAdmin from "./Pages/Admin/ManagePackageAdmin";
import CreatePackageAdmin from "./Pages/Admin/CreatePackageAdmin";
import EditPackageAdmin from "./Pages/Admin/EditPackageAdmin";
import BookingHistoryAdmin from "./Pages/Admin/BookingHistoryAdmin";

export default function App() {
  return (
    <Routes>
      {/* 🧩 เส้นทางหลักของ Admin */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="packages" element={<ManagePackageAdmin />} />
        <Route path="package" element={<CreatePackageAdmin />} />
        <Route path="package/:id" element={<EditPackageAdmin />} />
        <Route path="booking/histories" element={<BookingHistoryAdmin />} />
      </Route>

      {/* 🏠 เข้ามา root จะพาไปหน้า booking histories */}
      <Route path="/" element={<Navigate to="/admin/booking/histories" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
