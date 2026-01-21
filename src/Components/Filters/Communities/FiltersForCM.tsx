/**
 * ชื่อไฟล์: FiltersForCM.tsx
 * คำอธิบาย: Component Dropdown Filter สำหรับ Role: SuperAdmin, Admin, Member
 */
import { useState } from "react";
import { Filter } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterProps = {
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
};
/**
 * คำอธิบาย :
 * Component Dropdown Filter สำหรับ Role: SuperAdmin, Admin, Member
 * input: options (FilterOption[]), selected (string), onChange (function)
 * output: Dropdown UI สำหรับกรองข้อมูล
 */
export default function FiltersForCM({ options, selected, onChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* ปุ่มหลัก กดเพื่อเปิด/ปิด dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 h-12 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"
      >
        {/* ไอคอนกรอง */}
        <Filter className="w-4 h-4 " />
        {/* แสดงชื่อ option ที่เลือกอยู่ */}
        <span>{options.find((option) => option.value === selected)?.label}</span>
        {/* ไอคอนลูกศร ขึ้น/ลง */}
        <svg
          className="text-black"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="m12 15l-5-5h10z" />
        </svg>
      </button>

      {/* เมนู dropdown */}
      {isOpen && (
        <div className="absolute w-40 mt-2 items-center text-center border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 z-10">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="block w-full text-left px-8 py-2 hover:bg-green-200 hover:rounded-md"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
