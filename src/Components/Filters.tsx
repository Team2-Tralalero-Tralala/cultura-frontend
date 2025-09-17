import React, { useState } from "react";
import { ChevronDown, Filter } from "lucide-react"; // ใช้ icon จาก library lucide-react

// type ของแต่ละ option ใน dropdown
type FilterOption = {
  label: string; // ข้อความที่จะแสดงในเมนู เช่น "สมาชิก"
  value: string; // ค่าที่จะส่งกลับ เช่น "member"
};

// type ของ props ที่ component นี้จะรับจาก parent
type FilterProps = {
  options: FilterOption[];         // รายการตัวเลือกทั้งหมด
  selected: string;                // ค่าที่เลือกอยู่ปัจจุบัน
  onChange: (value: string) => void; // ฟังก์ชัน callback เวลาเลือกค่าใหม่
};

export default function FilterDropdown({ options, selected, onChange }: FilterProps) {
  const [open, setOpen] = useState(false); // state สำหรับเก็บว่าเมนูเปิด/ปิดอยู่หรือไม่

  // ฟังก์ชันเวลามีการเลือก option
  const handleSelect = (value: string) => {
    onChange(value);  // ส่งค่าที่เลือกกลับไปให้ parent ผ่าน props
    setOpen(false);   // ปิด dropdown หลังเลือกเสร็จ
  };

  return (
    <div className="relative inline-block">
      {/* ปุ่มหลัก กดเพื่อเปิด/ปิด dropdown */}
      <button
        onClick={() => setOpen(!open)} // toggle เปิด/ปิด
        className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
      >
        {/* ไอคอนกรอง */}
        <Filter className="w-4 h-4" />
        {/* แสดงชื่อ option ที่เลือกอยู่ */}
        <span>{options.find(opt => opt.value === selected)?.label}</span>
        {/* ไอคอนลูกศร ขึ้น/ลง */}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* เมนู dropdown */}
      {open && (
        <div className="absolute mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
          {options.map((opt) => (
            <button
              key={opt.value} // key ต้องไม่ซ้ำ
              onClick={() => handleSelect(opt.value)} // เมื่อเลือกจะเรียก handleSelect
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                opt.value === selected ? "bg-gray-200 font-medium" : "" // ไฮไลท์ option ที่เลือกอยู่
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
