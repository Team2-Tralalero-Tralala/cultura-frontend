/*
 * คำอธิบาย : Component SearchBarTable สำหรับค้นหาข้อมูลในตาราง
*/ 
import React from "react";
import { FiSearch } from "react-icons/fi"; 

// กำหนดชนิดของ props ที่จะส่งเข้ามาใน SearchBar
type SearchBarProps = {
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
};

// สร้าง Component SearchBar
export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div
      className="flex items-center border border-gray-300 rounded-lg px-2 bg-white w-60 h-12">
      {/* ไอคอนค้นหา */}
      <FiSearch className="text-gray-500 w-5 h-5" />
      {/* ช่องพิมพ์ข้อความ */}
      <input
        type="text"
        value={value} 
        onChange={onChange} 
        placeholder="ค้นหา" 
        className="ml-2 flex-1 outline-none text-sm"
      />
    </div>
  );
}
