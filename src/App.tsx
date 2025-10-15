import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "./Components/SidebarAdmin";
import BookingDetailAdmin from "./Pages/BookingDetailAdmin";
import NavbarSam from "./Components/NavbarSam";


function App() {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col bg-[#f4f5f7]">
        <NavbarSam />
        {/* <BookingDetailAdmin /> */}
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route
              path="/admin/booking/:bookingId"
              element={<BookingDetailAdmin />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
