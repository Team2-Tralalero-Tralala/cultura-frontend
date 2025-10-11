// import { Route, Routes, Navigate } from "react-router";
// import ProtectedRoute from "./Libs/ProtectRoute";
// import RoleRedirect from "./Libs/RoleRedirect";

// import LoginAdmin from "./Pages/LoginAdmin.tsx";
// // import Register from "./Pages/Register.tsx";
// // import ForgotPassword from "./Pages/ForgotPassword.tsx";
// import LoginTourist from "./Pages/LoginTourist.tsx";
// import CreateAccountPage from "./Components/Account/CreateAccountPage.tsx";

// function App() {
//   return (
//     <>
//       <Routes>
//         {/* public */}
//         <Route path="guest/login" element={<LoginTourist />} />
//         <Route path="guest/partner/login" element={<LoginAdmin />} />
//         {/* <Route path="/register" element={<Register />} /> */}
//         {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

//         {/* root -> เด้งตาม role */}
//         <Route index element={<RoleRedirect />} />

//         {/* private routes */}
//         {/* ชั่วคราว: เปิดให้เข้าตรงได้เลย */}
//         <Route
//           path="/super/account/admin/create"
//           element={<CreateAccountPage />}
//         />

//         {/* fallback */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </>
//   );
// }

// export default App;
import { Route, Routes, Navigate } from "react-router";

import RoleRedirect from "./Libs/RoleRedirect";

import LoginAdmin from "./Pages/LoginAdmin.tsx";
// import Register from "./Pages/Register.tsx";
// import ForgotPassword from "./Pages/ForgotPassword.tsx";
import LoginTourist from "./Pages/LoginTourist.tsx";
import CreateAccountPage from "./Components/Account/CreateAccountPage.tsx";

//  import toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditAccountPage from "./Components/Account/EditAccountPage.tsx";

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
        {/* ชั่วคราว: เปิดให้เข้าตรงได้เลย */}
        <Route
          path="/super/account/admin/create"
          element={<CreateAccountPage />}
        />
        <Route
          path="/super/account/admin/:adminId/edit"
          element={<EditAccountPage />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/*  เพิ่ม ToastContainer เพื่อให้ทุกหน้าใช้ toast ได้ */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}

export default App;
