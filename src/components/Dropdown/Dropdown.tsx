/*
 * Component: Dropdown
 * คำอธิบาย: Dropdown สำหรับเลือกค่าจากรายการตัวเลือก โดยแสดง label ของค่าที่ถูกเลือก
 */

import { useEffect, useRef, useState } from "react";

type DropdownOption = {
  label: string; // ข้อความที่แสดง
  value: string; // ค่าที่ส่งออกเมื่อเลือก
};

type DropdownProps = {
  options: DropdownOption[];        // รายการตัวเลือกทั้งหมด
  value: string;                    // ค่าที่เลือกปัจจุบัน
  onChange: (value: string) => void; // callback เมื่อผู้ใช้เลือกใหม่
  className?: string;               // คลาสเพิ่มเติมถ้ามี
};

export default function Dropdown({ options, value, onChange, className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);        // เปิด/ปิด dropdown
  const ref = useRef<HTMLDivElement>(null);       // อ้างอิง DOM หลัก
  const selected = options.find((opt) => opt.value === value); // หาค่าที่เลือกอยู่

  // ปิด dropdown เมื่อคลิกนอก component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* ปุ่มหลักแสดงค่าปัจจุบัน */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-[138px] h-[39px] flex items-center justify-between
                   rounded-md border border-slate-300 bg-white px-3 text-sm
                   font-medium shadow-sm hover:bg-slate-50"
      >
        {selected ? selected.label : "เลือก"}
        <svg
          viewBox="0 0 20 20"
          className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5.5 7.5l4.5 4.5 4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* รายการ dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-[138px] rounded-md border border-slate-200
                     bg-white py-1 text-sm shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={String(opt.value)}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 hover:bg-slate-100 ${
                value === opt.value ? "bg-slate-50 font-semibold" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}