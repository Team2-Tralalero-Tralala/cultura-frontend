import { useState } from "react";
import PriceRange from "../Components/PriceRange/PriceRange";

/**
 * นี่คือหน้าตัวอย่าง (Demo Page) สำหรับแสดงการทำงานของ PriceRange Component
 * หน้าที่หลักของหน้านี้คือการ "ควบคุม" state ของ PriceRange
 */
const PriceDemo = () => {
  // 1. สร้าง state ใน Page นี้ เพื่อเป็น "เจ้าของ" ข้อมูลช่วงราคา
  // PriceRange Component จะรับค่านี้ไปแสดงผลเท่านั้น จะไม่สร้าง state ของตัวเอง
  const [range, setRange] = useState({ min: 0, max: 50000 });

  return (
    <div className="min-h-screen bg-fuchsia-200/30 p-6 flex items-center justify-center">
      {/*
        2. ส่ง state (range) และ function สำหรับอัปเดต state (setRange)
           เข้าไปใน props `value` และ `onChange` ของ PriceRange
           ซึ่งเป็นรูปแบบที่เรียกว่า "Controlled Component"
      */}
      <PriceRange
        value={range}
        onChange={setRange}
        min={0}
        max={70000}
        step={100}
      />
    </div>
  );
};

export default PriceDemo;