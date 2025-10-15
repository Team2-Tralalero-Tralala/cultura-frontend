// 📄 src/Layouts/SuperAdmin/SuperAdminRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import CreateAccountPage from "../../Layouts/SuperAdmin/CreateAccountPage";
import EditAccountPage from "../../Layouts/SuperAdmin/EditAccountPage"; 

/*
 * Module: SuperAdminRoutes
 * Description: กำหนดเส้นทาง (Routes) สำหรับ Super Admin
 * - สามารถสร้างและแก้ไขบัญชีได้ 3 ประเภท (Admin / Member / Tourist)
 * - เมื่อเปลี่ยน role ในหน้า CreateAccountPage จะเปลี่ยน path อัตโนมัติ
 */

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 🔹 หน้าเพิ่มบัญชีผู้ดูแลระบบ (Admin) */}
      <Route
        path="/admin/create"
        element={<CreateAccountPage defaultRole="Admin" />}
      />

      {/* 🔹 หน้าเพิ่มบัญชีสมาชิก (Member) */}
      <Route
        path="/member/create"
        element={<CreateAccountPage defaultRole="Member" />}
      />

      {/* 🔹 หน้าเพิ่มบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route
        path="/tourist/create"
        element={<CreateAccountPage defaultRole="Tourist" />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ดูแลระบบ (Admin) */}
      <Route
        path="/admin/:adminId/edit"
        element={<EditAccountPage />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีสมาชิก (Member) */}
      <Route
        path="/member/:memberId/edit"
        element={<EditAccountPage />}
      />

      {/* 🔸 หน้าแก้ไขบัญชีผู้ใช้ทั่วไป (Tourist) */}
      <Route
        path="/tourist/:touristId/edit"
        element={<EditAccountPage />}
      />
    </Routes>
  );
};

export default SuperAdminRoutes;
