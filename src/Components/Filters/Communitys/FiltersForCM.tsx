/*
 * Filter ใช้สำหรับ Role: SuperAdmin, Admin, Member
*/

import { useState } from "react";
import { Filter } from "lucide-react"; // ใช้ icon จาก library lucide-react

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
        className="flex items-center gap-5 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"
      >
        {/* ไอคอนกรอง */}
        <Filter className="w-4 h-4" />
        {/* แสดงชื่อ option ที่เลือกอยู่ */}
        <span>{options.find(opt => opt.value === selected)?.label}</span>
        {/* ไอคอนลูกศร ขึ้น/ลง */}
        <svg className="text-black" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m12 15l-5-5h10z"/></svg>
      </button>

      {/* เมนู dropdown */}
      {open && (
        <div className="absolute w-38 mt-2 items-center text-center border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
          {options.map((opt) => (
            <button
              key={opt.value} // key ต้องไม่ซ้ำ
              onClick={() => handleSelect(opt.value)} // เมื่อเลือกจะเรียก handleSelect
              className={`block w-full text-left px-8 py-2 hover:bg-green-200 hover:rounded-md
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
