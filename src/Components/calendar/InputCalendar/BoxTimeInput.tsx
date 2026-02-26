/**
 * คำอธิบาย : Component สำหรับกล่องอินพุตเวลาแบบ 2 ช่อง (ชั่วโมงและนาที) ในรูปแบบ HH:mm
 */
"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export type BoxTimeInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
  label?: React.ReactNode;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  height?: number | string;
  className?: string;
  errorText?: string;
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงค่าตัวเลขหรือข้อความให้เป็นรูปแบบขนาดของ CSS (เช่น เติม px ต่อท้ายตัวเลข)
 * Input: value (number | string) - ค่าขนาดที่ต้องการแปลง
 * Output : ค่าขนาดที่ถูกต้องตามรูปแบบ CSS (string) หรือ undefined
 */
const toCssSize = (value?: number | string) =>
  value === undefined ? undefined : typeof value === "number" ? `${value}px` : value;

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

/*
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงผลกล่องอินพุตเวลา แยกเป็นชั่วโมงและนาที
 * Input: props (BoxTimeInputProps) - ข้อมูล property ต่างๆ เช่น value (ค่าเวลา), onChange (ฟังก์ชันจัดการการเปลี่ยนค่า), label (ข้อความกำกับ)
 * Output : JSX.Element (ส่วนแสดงผล UI ของกล่องอินพุตเวลา)
 */
export const BoxTimeInput: React.FC<BoxTimeInputProps> = ({
  value,
  defaultValue,
  onChange,
  label,
  required = false,
  id,
  disabled = false,
  height = 44,
  className,
  errorText,
}) => {
  const autoId = useId();
  const inputId = id ?? `time-input-${autoId}`;
  const [hour, setHh] = useState("");
  const [minute, setMm] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการเหตุการณ์การคลิกภายนอก Component (Click Outside) เพื่อปิดส่วนแสดงผลของ Picker
   * Input : event (MouseEvent จากการคลิกของผู้ใช้งาน)
   * Output : ทำการซ่อนส่วนแสดงผล (setShowPicker(false)) เมื่อมีการคลิกนอกพื้นที่ของ pickerRef
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasError = Boolean(errorText);
  const hasValue = Boolean(hour || minute);
  const resolvedHeight = toCssSize(height) ?? "44px";

  /*
  * คำอธิบาย : ฟังก์ชันสำหรับจัดการแยกข้อมูลเวลา (ชั่วโมงและนาที) จากสตริงเพื่อนำไปกำหนดค่าให้กับ State ภายในคอมโพเนนต์
  * Input : value (ข้อมูลเวลา), defaultValue (ค่าเวลาเริ่มต้น)
  * Output : กำหนดค่าชั่วโมง (hh) และนาที (mm) ลงใน State ของระบบ
  */
  useEffect(() => {
    const time = (value ?? defaultValue ?? "") as string;
    if (!time) {
      setHh("");
      setMm("");
      return;
    }
    const [splitHour, splitMinute] = time.split(":");
    setHh(splitHour ?? "");
    setMm(splitMinute ?? "");
  }, [value, defaultValue]);

  const emitChange = (next: string) => {
    onChange?.(next);
  };
  /* * คำอธิบาย: ฟังก์ชันสำหรับกรองค่าให้เหลือเพียงตัวเลข 2 หลัก
   * Input: value (string) - ค่าที่ต้องการกรอง
   * Output: string - ค่าตัวเลข 2 หลัก
   */
  const cleanDigits = (value: string) => value.replace(/\D+/g, "").slice(0, 2);

  /* * คำอธิบาย: ฟังก์ชันสำหรับจัดการเมื่อมีการพิมพ์เปลี่ยนค่าชั่วโมง
   * Input: rawValue (string) - ค่าดิบที่ผู้ใช้พิมพ์
   * Output: - (void)
   */
  const handleHourChange = (raw: string) => {
    const digits = cleanDigits(raw);
    setHh(digits);
    if (digits.length === 2 && minute.length === 2) {
      emitChange(`${digits}:${minute}`);
    } else {
      emitChange("");
    }
  };

  const clearAll = () => {
    setHh("");
    setMm("");
    emitChange("");
  };

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* ปรับ Label Wrapper เป็น flex เพื่อใส่ Error ด้านขวา */}
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label htmlFor={inputId} className="text-base font-semibold text-gray-800">
            {label}
            {required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
        )}

        {/* ส่วนแสดงข้อความ Error */}
        {hasError && (
          <span className="text-xs text-red-600 ml-2 whitespace-nowrap">
            {errorText}
          </span>
        )}
      </div>

      <div className="relative mt-1" ref={pickerRef}>
        {/* กล่องหลัก */}
        <div
          id={inputId}
          onClick={() => !disabled && setShowPicker(!showPicker)}
          className={[
            "flex items-center justify-between w-full rounded-form border px-4 py-2 cursor-pointer",
            "bg-white font-sarabun text-base transition-all",
            disabled ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500",
            hasError ? "border-red-500 ring-1 ring-red-500" : "border-gray-400",
          ].join(" ")}
          style={{ height: resolvedHeight }}
        >
          <div className="flex items-center gap-1">
            <span className={hour ? "text-gray-900" : "text-gray-400"}>{hour || "00"}</span>
            <span className="text-gray-500">:</span>
            <span className={minute ? "text-gray-900" : "text-gray-400"}>{minute || "00"}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasValue && !disabled && (
              <Icon
                icon="material-symbols:close"
                className="w-5 h-5 text-gray-400 hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); clearAll(); }}
              />
            )}
            <Icon icon="uil:clock" className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Custom Time Picker (Hours & Minutes) */}
        {showPicker && !disabled && (
          <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl flex overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* คอลัมน์ชั่วโมง */}
            <div className="flex-1 max-h-60 overflow-y-auto border-r border-gray-100 scrollbar-hide">
              {/* <div className="sticky top-0 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 text-center uppercase">ชั่วโมง</div> */}
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setHh(h); if (minute) emitChange(`${h}:${minute}`); }}
                  className={`w-full py-2.5 text-sm transition-colors ${hour === h ? "bg-[#055035] text-white font-bold" : "hover:bg-green-50 text-gray-700"}`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* คอลัมน์นาที */}
            <div className="flex-1 max-h-60 overflow-y-auto scrollbar-hide">
              {/* <div className="sticky top-0 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 text-center uppercase">นาที</div> */}
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMm(m); if (hour) { emitChange(`${hour}:${m}`); setShowPicker(false); } }}
                  className={`w-full py-2.5 text-sm transition-colors ${minute === m ? "bg-[#055035] text-white font-bold" : "hover:bg-green-50 text-gray-700"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxTimeInput;
