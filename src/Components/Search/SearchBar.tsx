// SearchBar แบบ Header
import React, { useState } from "react";
import { Icon } from "@iconify/react";

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
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center w-full max-w-xs bg-gray-100 rounded-full overflow-hidden">
      {/* ช่อง input สำหรับพิมพ์ข้อความ */}
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-4 bg-transparent outline-none text-sm"
      />
      {/* เส้นคั่นระหว่าง input กับปุ่ม search */}
      <div className="w-px h-10 bg-gray-300"></div>
      {/* ปุ่ม search */}
      <button className="flex justify-center items-center rounded-full w-10 h-10">
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
