import { useState } from "react";
import { Dropdown } from "./components/Dropdown/Dropdown";

function App() {
  // สร้าง state สำหรับเก็บค่าที่เลือกจาก Dropdown
  // เริ่มต้นให้ค่า default เป็น "10"
  const [selected, setSelected] = useState("10");

  // สร้าง options สำหรับ dropdown แต่ละ option มี label (ข้อความที่แสดง) และ value (ค่าที่แท้จริง)
  const options = [
    { label: "10 ", value: "10" },
    { label: "20 ", value: "20" },
    { label: "50 ", value: "50" },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      
      {/* ใช้ Dropdown component */}
      <div className="p-6">
      <Dropdown options={options} value={selected} onChange={setSelected} />
      {/* แสดงค่าที่เลือกออกมาด้านล่าง */}
      <p className="ml-30">คุณเลือก: {selected}</p>
      </div>
    </>
  );
}

export default App;