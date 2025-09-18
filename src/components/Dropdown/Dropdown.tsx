/*
 * Component: Dropdown
 * คำอธิบาย: Dropdown สำหรับเลือกค่าจากรายการตัวเลือกหนึ่ง โดยแสดง label ของตัวเลือกที่ถูกเลือก
 * Props:
 *   - options: Array ของตัวเลือกแต่ละตัว { label, value }
 *   - value: ค่าที่ถูกเลือกปัจจุบัน
 *   - onChange: ฟังก์ชัน callback เมื่อผู้ใช้เลือกตัวเลือกใหม่
 */


import { useState } from "react";

// กำหนด type ของตัวเลือกใน dropdown
type DropdownOption = {
  label: string; // ข้อความที่จะแสดงให้ผู้ใช้เห็น
  value: string; // ค่าจริงที่จะส่งออกเมื่อถูกเลือก
};

// กำหนด props ของ Dropdown component
type DropdownProps = {
  options: DropdownOption[];       // ตัวเลือกทั้งหมดของ dropdown
  value: string;                   // ค่าที่ถูกเลือกอยู่ตอนนี้
  onChange: (value: string) => void; // ฟังก์ชันเรียกเมื่อมีการเปลี่ยนค่า
};

export const Dropdown = ({ options, value, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false); // state เก็บว่า dropdown เปิดอยู่หรือไม่

  // หาตัวเลือกที่ตรงกับค่าปัจจุบัน
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative inline-block w-24">
      {/* ปุ่มหลักของ dropdown */}
      <button
        onClick={() => setOpen(!open)} // toggle เปิด/ปิด dropdown
        className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-white text-gray-700"
      >
        {/* แสดง label ของตัวเลือกที่ถูกเลือก*/}
        <span>{selected ? selected.label : ""}</span>

        {/* ลูกศรด้านขวา หมุนเมื่อ dropdown เปิด */}
        <span
          className={`ml-2 text-xs transform transition-transform ${open ? "rotate-180" : "" }`}> 
          ▼ 
        </span> 
      </button>

      {/* เมนู dropdown แสดงเมื่อ open = true */}
      {open && (
        <div className="absolute mt-2 w-24 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value} // key เพื่อให้ React track element ได้ถูกต้อง
              onClick={() => {
                onChange(opt.value); // เรียก callback เมื่อเลือกตัวเลือก
                setOpen(false);       // ปิด dropdown หลังจากเลือก
              }}
              className={`block w-full text-center px-4 py-2 hover:bg-green-100 ${
                value === opt.value ? "font-medium" : "" // ตัวเลือกที่ถูกเลือกทำตัวหนา
              }`}
            >
              {opt.label} {/* แสดงข้อความของตัวเลือก */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};