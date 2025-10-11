import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./Page/HomePage";

//ใช้ main.tsx ใช้ route /filters
//ใช้ ./Page/HomePage.tsx แก้ไขข้อมูลใน filters

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/filters" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
