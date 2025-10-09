import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./Layouts/SuperAdminLayout"; // <<<<<< ตรงนี้สำคัญ

import DashboardSuperAdmin from "./Pages/SuperAdmin/DashboardSuperAdmin";
import ManageCommunity from "./Pages/SuperAdmin/ManageCommunity";
import ManageUser from "./Pages/SuperAdmin/ManageUser";
import BlockUser from "./Pages/SuperAdmin/BlockUser";
import ManagePackageSuperAdmin from "./Pages/SuperAdmin/ManagePackageSuperAdmin";
import ApprovePackage from "./Pages/SuperAdmin/ApprovePackage";
import ManageTag from "./Pages/SuperAdmin/ManageTag";
import LogSuperAdmin from "./Pages/SuperAdmin/LogSuperAdmin";
import Setting from "./Pages/SuperAdmin/Setting";
import LogoutSuperAdmin from "./Pages/SuperAdmin/LogoutSuperAdmin";

export default function App() {
  return (
      <Routes>
        <Route path="/super" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="ping" element={<div style={{color:'black'}}>PING OK</div>} />
          <Route path="dashboard" element={<DashboardSuperAdmin />} />
          <Route path="communities" element={<ManageCommunity />} />
          <Route path="users" element={<ManageUser />} />
          <Route path="user/blocked" element={<BlockUser />} />
          <Route path="packages" element={<ManagePackageSuperAdmin />} />
          <Route path="package-requests" element={<ApprovePackage />} />
          <Route path="tags" element={<ManageTag />} />
          <Route path="logs" element={<LogSuperAdmin />} />
          <Route path="setting" element={<Setting />} />
          <Route path="logout" element={<LogoutSuperAdmin />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/super/dashboard" replace />} />
      </Routes>
  );
}
