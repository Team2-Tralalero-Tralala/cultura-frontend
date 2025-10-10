import { Route, Routes, Navigate } from "react-router";
import ProtectedRoute from "./Libs/ProtectRoute";
import RoleRedirect from "./Libs/RoleRedirect";

import LoginAdmin from "./Pages/LoginAdmin.tsx";
// import Register from "./Pages/Register.tsx";
// import ForgotPassword from "./Pages/ForgotPassword.tsx";
import LoginTourist from "./Pages/LoginTourist.tsx";
import CreateAccountPage from "./Components/Account/CreateAccountPage.tsx";

function App() {
  return (
    <>
      <Routes>
        {/* public */}
        <Route path="guest/login" element={<LoginTourist />} />
        <Route path="guest/partner/login" element={<LoginAdmin />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

        {/* root -> เด้งตาม role */}
        <Route index element={<RoleRedirect />} />

        {/* private routes */}
        {/* private routes */}
        <Route element={<ProtectedRoute allow={["superadmin"]} />}>
          <Route
            path="/super/account/admin/create"
            element={<CreateAccountPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
