/*
 * คำอธิบาย : Component SearchBar แบบ Header สำหรับค้นหาแพ็กเกจกิจกรรม
*/
import { Icon } from "@iconify/react";
import React, { useState } from "react";

// กำหนด type ของ props ที่ส่งเข้ามาใน component
type SearchBarProps = {
  onSearch: (text: string) => void;
  placeholder?: string;
};

// สร้าง Component SearchBar
function SearchBar({ onSearch, placeholder = "ค้นหา" }: SearchBarProps) {
  const [text, setText] = useState("");

  // ฟังก์ชันเรียกเมื่อมีการพิมพ์ใน input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // ฟังก์ชันเรียกเมื่อกด Enter หรือคลิกปุ่มค้นหา
  const handleSearch = () => {
    if (text.trim()) {
      onSearch(text.trim());
    }
  };

  // ฟังก์ชันเรียกเมื่อกด Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center w-full max-w-xs bg-gray-100 rounded-full overflow-hidden">
      {/* ช่อง input สำหรับพิมพ์ข้อความ */}
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-4 bg-transparent outline-none text-sm"
      />
      {/* เส้นคั่นระหว่าง input กับปุ่ม search */}
      <div className="w-px h-10 bg-gray-300"></div>
      {/* ปุ่ม search */}
      <button
        onClick={handleSearch}
        className="flex justify-center items-center rounded-full w-10 h-10 hover:bg-gray-200 transition-colors"
      >
        <Icon
          icon="mdi:magnify"
          className="w-5 h-5 relative"
          style={{
            color: "#00BF6A",
            right: "2px",
            transform: "scale(1.1)",
          }}
        />
      </button>
    </div>
  );
}

export default SearchBar;
