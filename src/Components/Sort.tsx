/* 
 * คำอธิบาย : Component Sort ใช้สำหรับสร้าง Dropdown เลือกตัวเลือกการเรียงลำดับ (Sort) 
 * เช่น "ล่าสุด", "แนะนำ", "ราคาต่ำสุด", "ราคาสูงสุด"
 * ขนาดปุ่ม 138x39 px 
 */

import React, { useEffect, useRef, useState } from "react";

type SortValue = "latest" | "recommended" | "price_asc" | "price_desc";

const OPTIONS: Record<SortValue, string> = {
  latest: "ล่าสุด",
  recommended: "แนะนำ",
  price_asc: "ราคาต่ำสุด",
  price_desc: "ราคาสูงสุด",
};

type SortProps = {
  value: SortValue;                // ค่าที่เลือกปัจจุบัน
  onChange: (v: SortValue) => void; // ฟังก์ชัน callback เมื่อมีการเลือกใหม่
  className?: string;              // กำหนดคลาสเพิ่มเติม
};

/* 
 * คำอธิบาย : ฟังก์ชัน Sort แสดงปุ่ม dropdown และรายการให้เลือก
 * Input : props { value: SortValue, onChange: (v: SortValue), className?: string }
 * Output : JSX.Element (UI ของ dropdown sort)
 */
export default function Sort({ value, onChange, className = "" }: SortProps) {
  const [open, setOpen] = useState(false);       // state เปิด/ปิด dropdown
  const ref = useRef<HTMLDivElement>(null);      // อ้างอิง DOM ของ component

  // คำอธิบาย : useEffect สำหรับปิด dropdown เมื่อผู้ใช้คลิกนอก component
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* ปุ่มหลัก 138x39 แสดงค่าปัจจุบัน */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-[138px] h-[39px] flex items-center justify-between
                   rounded-md border border-slate-300 bg-white px-3 text-sm
                   font-medium shadow-sm hover:bg-slate-50"
      >
        {OPTIONS[value]}
        <svg
          viewBox="0 0 20 20"
          className={`ml-2 h-4 w-4 ${open ? "rotate-180" : ""}`}
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

      {/* แสดงรายการตัวเลือก */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-[138px] rounded-md border border-slate-200
                     bg-white py-1 text-sm shadow-lg"
        >
          {(Object.keys(OPTIONS) as SortValue[]).map((key) => (
            <li
              key={key}
              role="option"
              aria-selected={value === key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 hover:bg-slate-100 ${
                value === key ? "bg-slate-50 font-semibold" : ""
              }`}
            >
              {OPTIONS[key]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
