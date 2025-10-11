import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "./Components/SidebarAdmin.tsx";
import BookingDetailAdmin from "./Pages/BookingDetailAdmin.tsx";
import { memberLogin } from "./Libs/dev-login";

if (import.meta.env.DEV) {
  memberLogin();
}

function App() {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <Routes>
        <Route path="/admin/booking/:bookingId" element={<BookingDetailAdmin />}/>
      </Routes>
    </div>
  );
}

export default App;
