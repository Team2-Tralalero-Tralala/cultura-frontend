import { Route, Routes, Navigate } from "react-router-dom";
import SuperAdminLayout from './Layouts/SuperAdmin/SuperAdminLayout';
import TagsPage from "./Pages/ManageTags";

//import AdminLayout from './Layouts/Admin/AdminLayout';
//import AdminRoutes from './Layouts/Admin/AdminRoutes';

//import MemberLayout from './Layouts/Member/MemberLayout';
//import MemberRoutes from './Layouts/Member/MemberRoutes';


function App() {
  return (
    <Routes>
      <Route path="/super/*" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="tags" replace />} />
        <Route path="tags" element={<TagsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default  App;

