/*
 * คำอธิบาย : Component Sort ใช้สำหรับสร้าง Dropdown เลือกค่าใดก็ได้
 * ไม่จำกัดเฉพาะ "ล่าสุด" / "แนะนำ" / "ราคา" อีกต่อไป
 * Input  : { value, onChange, options, className }
 * Output : Dropdown ที่ reuse ได้ทุกกรณี
 */

import { useEffect, useRef, useState } from "react";

export type OptionItem<TOptionValue extends string | number> = {
  value: TOptionValue;
  label: string;
};

export type SortProps<TOptionValue extends string | number> = {
  value: TOptionValue;
  onChange: (newValue: TOptionValue) => void;
  options: OptionItem<TOptionValue>[];
  placeholder?: string;
  className?: string;
};

export default function Sort<TOptionValue extends string | number>({
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  className = "",
}: SortProps<TOptionValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // หาป้ายชื่อ (label) จากค่าที่เลือก
  const selected = options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* ปุ่มหลัก */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-[138px] h-[39px] flex items-center justify-between
                   rounded-md border border-slate-300 bg-white px-3 text-sm
                   font-medium shadow-sm hover:bg-slate-50"
      >
        {selected}
        <svg
          viewBox="0 0 20 20"
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {/* รายการตัวเลือก */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-[138px] rounded-md border border-slate-200
                     bg-white py-1 text-sm shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
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
