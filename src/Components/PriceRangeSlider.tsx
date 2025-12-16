/*
 * คำอธิบาย : Component สำหรับเลือกช่วงราคาแบบ dual range slider
 * ใช้ MUI Slider component เพื่อแสดง slider แบบ dual handle
 * Input : min, max, value (array of 2 numbers), onChange
 * Output : JSX Component ที่แสดง slider และ input fields สำหรับแสดงราคา
 */

import { Slider } from "@mui/material";
import { useEffect, useState } from "react";

/*
 * ชนิดข้อมูล : PriceRangeSliderProps
 * คำอธิบาย : Props สำหรับ PriceRangeSlider component
 */
type PriceRangeSliderProps = {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
};

/*
 * ฟังก์ชัน : PriceRangeSlider
 * คำอธิบาย : แสดง dual range slider สำหรับเลือกช่วงราคา
 * Input : PriceRangeSliderProps (min, max, value, onChange, step, className)
 * Output : React Component ที่ render slider และ input fields
 */
export default function PriceRangeSlider({
  min = 100,
  max = 50000,
  value,
  onChange,
  step = 100,
  className = "",
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  /*
   * ฟังก์ชัน : handleSliderChange
   * คำอธิบาย : จัดการเมื่อมีการเปลี่ยนค่า slider
   * Input : event (Event), newValue (number | number[])
   * Output : void
   */
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setLocalValue(range);
    onChange(range);
  };

  /*
   * ฟังก์ชัน : handleMinInputChange
   * คำอธิบาย : จัดการเมื่อมีการเปลี่ยนค่า input ราคาต่ำสุด
   * Input : e (React.ChangeEvent<HTMLInputElement>)
   * Output : void
   */
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // แยกตัวเลขจาก "฿ 1,000" format
    const numericValue = parseInt(e.target.value.replace(/[฿,\s]/g, "")) || min;
    const newMin = Math.min(Math.max(numericValue, min), localValue[1]);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  /*
   * ฟังก์ชัน : handleMaxInputChange
   * คำอธิบาย : จัดการเมื่อมีการเปลี่ยนค่า input ราคาสูงสุด
   * Input : e (React.ChangeEvent<HTMLInputElement>)
   * Output : void
   */
  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // แยกตัวเลขจาก "฿ 50,000" format
    const numericValue = parseInt(e.target.value.replace(/[฿,\s]/g, "")) || max;
    const newMax = Math.max(Math.min(numericValue, max), localValue[0]);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  // อัปเดต localValue เมื่อ value prop เปลี่ยน
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {/* Slider */}
      <Slider
        value={localValue}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="off"
        sx={{
          color: "#00BF6A",
          height: 6,
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            backgroundColor: "#fff",
            border: "2px solid #00BF6A",
            "&:hover": {
              boxShadow: "0 0 0 8px rgba(0, 191, 106, 0.16)",
            },
            "&.Mui-active": {
              boxShadow: "0 0 0 8px rgba(0, 191, 106, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            backgroundColor: "#00BF6A",
            border: "none",
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#d1d5db",
            opacity: 1,
          },
        }}
      />

      {/* Price Input Fields */}
      <div className="flex items-center gap-2 w-full overflow-hidden">
        <input
          type="text"
          value={`฿ ${localValue[0].toLocaleString()}`}
          onChange={handleMinInputChange}
          className="flex-1 min-w-0 px-2 py-2 border border-emerald-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <span className="text-gray-500 shrink-0">-</span>
        <input
          type="text"
          value={`฿ ${localValue[1].toLocaleString()}`}
          onChange={handleMaxInputChange}
          className="flex-1 min-w-0 px-2 py-2 border border-emerald-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}
