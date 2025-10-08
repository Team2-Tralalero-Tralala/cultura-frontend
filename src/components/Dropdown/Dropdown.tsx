/* 
 * คำอธิบาย : Component Dropdown ใช้สำหรับสร้างรายการเลือก (select box)
 * ที่สามารถเลือกรายการจาก options ที่กำหนดได้ และแสดง label ของค่าที่เลือก
 * Input  : { options, value, onChange, className }
 * Output : แสดง dropdown ที่เลือกค่าได้ และส่งค่าใหม่กลับผ่าน onChange
 */

import { useEffect, useRef, useState } from "react";

/*
 * ประเภทข้อมูลของตัวเลือกแต่ละรายการ 
 * - label: ข้อความที่แสดงใน dropdown
 * - value: ค่าที่ส่งกลับเมื่อเลือก (รองรับทั้ง string และ number)
 */
type DropdownOption = {
  label: string;
  value: string | number;
};

/*
 * Props ที่ component รับเข้ามา
 * - options: รายการตัวเลือกทั้งหมด
 * - value: ค่าที่เลือกอยู่ปัจจุบัน
 * - onChange: ฟังก์ชัน callback ที่จะถูกเรียกเมื่อเลือกค่าใหม่
 * - className: สำหรับใส่ Tailwind class เพิ่มเติม (optional)
 */
type DropdownProps = {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
};

export default function Dropdown({
  options,
  value,
  onChange,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false); // สถานะเปิด/ปิด dropdown
  const ref = useRef<HTMLDivElement>(null); // ใช้ตรวจจับการคลิกนอก component

  // หา option ที่ตรงกับค่าปัจจุบัน เพื่อเอามาแสดงในปุ่มหลัก
  const selected = options.find((opt) => opt.value === value);

  /*
   * Effect: ปิด dropdown เมื่อคลิกนอกพื้นที่ component
   * ใช้ 'mousedown' เพื่อดัก event ก่อนที่ focus จะหาย
   */
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
      {/* ปุ่มหลักสำหรับเปิด/ปิด dropdown */}
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-[138px] h-[39px] flex items-center justify-between
                   rounded-md border border-slate-300 bg-white px-3 text-sm
                   font-medium shadow-sm hover:bg-slate-50"
      >
        {/* ถ้ายังไม่ได้เลือก แสดงข้อความเริ่มต้น "เลือก" */}
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

      {/* รายการ dropdown 
          - role="listbox": บอกว่าเป็นรายการให้เลือก
          - absolute positioning ให้อยู่ใต้ปุ่มหลัก
       */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-[138px] rounded-md border border-slate-200
                     bg-white py-1 text-sm shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={String(opt.value)} // รองรับทั้ง string/number key
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value); // ส่งค่ากลับไปยัง parent
                setOpen(false); // ปิด dropdown
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
