import React from "react";

// สร้าง type ของ option ที่จะใช้ใน dropdown
// โดย option แต่ละตัวต้องมี label (ข้อความที่แสดงให้ผู้ใช้เห็น)
// และ value (ค่าที่แท้จริงที่ใช้สำหรับประมวลผล เช่น id, code ฯลฯ)
type Option = {
  label: string;
  value: string;
};

// สร้าง type ของ props ที่ component Dropdown จะรับเข้ามา
type DropdownProps = {
  label?: string; // ข้อความ label ที่จะอยู่หน้ากล่อง dropdown (ไม่ใส่ก็ได้)
  options: Option[]; // รายการตัวเลือกทั้งหมด ที่จะถูกนำมา render ใน <option>
  value: string | number; // ค่าที่ถูกเลือกอยู่ตอนนี้ (ควบคุมจาก state ภายนอก)
  onChange: (value: string) => void; // ฟังก์ชัน callback เมื่อผู้ใช้เลือกค่าใหม่
};

// Component Dropdown ใช้สำหรับแสดง select box (dropdown menu)
export const Dropdown = ({ label, options, value, onChange }: DropdownProps) => {
  return (
    <div>
      {/* ถ้ามีการส่ง label มาด้วย จะ render ข้อความ label ไว้ด้านหน้า */}
      {label && <label className="mr-2">{label}</label>}

      {/* กล่อง select หลัก */}
      <select
        value={value} // ค่าเริ่มต้นหรือค่าปัจจุบัน (ถูกควบคุมจาก state ภายนอก)
        onChange={(e) => onChange(e.target.value)} // เมื่อเปลี่ยนค่า จะเรียก onChange พร้อมส่งค่าใหม่
        className="border rounded p-2" // ใส่สไตล์ด้วย tailwind
      >
        {/* วนลูป options ที่ส่งเข้ามา แล้วสร้าง <option> แต่ละตัว */}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
