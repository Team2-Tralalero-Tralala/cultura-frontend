import React, { useState } from "react";
import Filters from "./Components/filters";

function App() {
  // state เก็บค่าตัวกรองปัจจุบัน
  const [filter, setFilter] = useState("all");

  // กำหนดตัวเลือก filter ที่จะส่งไปให้ FilterDropdown
  const options = [
    { label: "ทั้งหมด", value: "all" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้ทั่วไป", value: "guest" },
  ];

  // ฟังก์ชันที่ทำงานเมื่อเลือก filter ใหม่
  const handleFilterChange = (value: string) => {
    setFilter(value);          // เปลี่ยนค่า state ให้เป็น option ที่เลือก
    console.log("เลือก:", value); // แสดงใน console
    // TODO: สามารถเพิ่มโค้ดกรอง array/list ได้ที่นี่
  };

  return (
    <div className="p-6">
      {/* เรียกใช้ FilterDropdown */}
      <Filters
        options={options}          // ส่ง option ทั้งหมด
        selected={filter}          // ส่งค่าที่เลือกอยู่ปัจจุบัน
        onChange={handleFilterChange} // ส่งฟังก์ชัน callback
      />

      {/* ตัวอย่างการแสดงผลตาม filter */}
      <div className="mt-4">
        {filter === "all" && <p>แสดงข้อมูลทั้งหมด</p>}
        {filter === "member" && <p>แสดงเฉพาะสมาชิก</p>}
        {filter === "guest" && <p>แสดงเฉพาะผู้ใช้ทั่วไป</p>}
      </div>
    </div>
  );
}

export default App;
