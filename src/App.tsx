/* eslint-disable @typescript-eslint/no-unused-vars */
import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./Layouts/SuperAdminLayout";
import AdminLayout from "./Layouts/AdminLayout";
import MemberLayout from "./Layouts/MemberLayout";
//import { superLogin, adminLogin, memberLogin, touristLogin } from "./Libs/dev-login";

import ManagePackageSuperAdmin from "./Pages/SuperAdmin/ManagePackageSuperAdmin";
import EditPackageSuperAdmin from "./Pages/SuperAdmin/EditPackageSuperAdmin";

import ManagePackageMember from "./Pages/Member/ManagePackageMember";
import CreatePackageMember from "./Pages/Member/CreatePackageMember";
import EditPackageMember from "./Pages/Member/EditPackageMember";

import CreatePackageAdmin from "./Pages/Admin/CreatePackageAdmin";
import EditPackageAdmin from "./Pages/Admin/EditPackageAdmin";
import ManagePackageAdmin from "./Pages/Admin/ManagePackageAdmin";
import DetailPackageSuperAdmin from "./Pages/SuperAdmin/DetailPackageSuperAdmin";
import { superLogin } from "./Libs/dev-login";

if (import.meta.env.DEV) {
  //memberLogin();
  superLogin();
  // adminLogin();
  // touristLogin();
}
export default function App() {
  return (
    <><Routes>
      {/* ================= Superadmin ================= */}
      <Route path="/super" element={<SuperAdminLayout />}>
        <Route path="ping" element={<div style={{ color: 'black' }}>PING OK</div>} />
        <Route path="packages" element={<ManagePackageSuperAdmin />} />
        <Route path="package/:id" element={<EditPackageSuperAdmin />} />
        <Route path="package/:id/detail" element={<DetailPackageSuperAdmin />} />
      </Route>
      {/* ================= Member ================= */}
      <Route path="/member" element={<MemberLayout />}>
        <Route path="packages" element={<ManagePackageMember />} />
        <Route path="package" element={<CreatePackageMember />} />
        <Route path="package/:id" element={<EditPackageMember />} />
      </Route>
      {/* ================= Admin ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="packages" element={<ManagePackageAdmin />} />
        <Route path="package" element={<CreatePackageAdmin />} />
        <Route path="package/:id" element={<EditPackageAdmin />} />
      </Route>
    </Routes><>
      </></>
  );
}
