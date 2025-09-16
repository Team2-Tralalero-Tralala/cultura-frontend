import { useState } from "react";
import { Dropdown } from "./components/Dropdown/Dropdown";

function App() {
  // สร้าง state สำหรับเก็บค่าที่เลือกจาก Dropdown
  // เริ่มต้นให้ค่า default เป็น "10"
  const [selected, setSelected] = useState("10");

  // สร้าง options สำหรับ dropdown แต่ละ option มี label (ข้อความที่แสดง) และ value (ค่าที่แท้จริง)
  const options = [
    { label: "10 แถว", value: "10" },
    { label: "20 แถว", value: "20" },
    { label: "50 แถว", value: "50" },
  ];

  return (
    <>
      {/* แสดงหัวข้อใหญ่ */}
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      
      {/* ใช้ Dropdown component */}
      <Dropdown
        label="เลือกจำนวนแถว:"   // แสดงข้อความ label ด้านหน้า dropdown
        options={options}         // ส่ง options เข้าไป
        value={selected}          // ค่าที่ถูกเลือก (ผูกกับ state)
        onChange={setSelected}    // ฟังก์ชันที่เรียกเมื่อเปลี่ยนค่า (อัปเดต state)
      />

      {/* แสดงค่าที่เลือกออกมาด้านล่าง */}
      <p className="mt-4">คุณเลือก: {selected}</p>
    </>
  );
}

export default App;