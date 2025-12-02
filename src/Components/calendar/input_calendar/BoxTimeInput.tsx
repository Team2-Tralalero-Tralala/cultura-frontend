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
    const hiddenTimeRef = useRef<HTMLInputElement | null>(null);

    const handleClockClick = () => {
        if (!hiddenTimeRef.current) return;
        const currentTime =
            hour.length === 2 && minute.length === 2 ? `${hour}:${minute}` : "";
        hiddenTimeRef.current.value = currentTime;
        if (hiddenTimeRef.current.showPicker) {
            hiddenTimeRef.current.showPicker();
        } else {
            hiddenTimeRef.current.focus();
            hiddenTimeRef.current.click();
        }
    };

    /* * คำอธิบาย: ฟังก์ชันสำหรับจัดการเมื่อมีการเปลี่ยนแปลงค่าจาก input type="time" ที่ซ่อนอยู่
     * Input: event (React.ChangeEvent<HTMLInputElement>)
     * Output: - (void)
     */
    const handleHiddenTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (!value) {
            setHh("");
            setMm("");
            emitChange("");
            return;
        }
        const [hour, minute] = value.split(":");
        setHh(hour ?? "");
        setMm(minute ?? "");
        emitChange(value);
    };
    const hasError = Boolean(errorText);
    const hasValue = Boolean(hour || minute);
    const resolvedHeight = toCssSize(height) ?? "44px";
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

    /* * คำอธิบาย: ฟังก์ชันสำหรับจัดการเมื่อมีการพิมพ์เปลี่ยนค่านาที
     * Input: rawValue (string) - ค่าดิบที่ผู้ใช้พิมพ์
     * Output: - (void)
     */
    const handleMinuteChange = (raw: string) => {
        const digits = cleanDigits(raw);
        setMm(digits);
        if (hour.length === 2 && digits.length === 2) {
            emitChange(`${hour}:${digits}`);
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

            <div className="relative mt-1">
                {/* กล่องหลัก */}
                <div
                    id={inputId}
                    className={[
                        "block w-full rounded-form border px-5 py-2 pr-10",
                        "bg-white font-sarabun text-base leading-relaxed",
                        "flex items-center gap-2",
                        disabled ? "opacity-60 cursor-not-allowed" : "",
                        hasError
                            ? "border-red-500 focus-within:ring-red-500 focus-within:border-red-500"
                            : "border-gray-400 focus-within:ring-gray-400 focus-within:border-gray-500",
                        "placeholder:text-gray-500 text-gray-900",
                        "focus:outline-none focus-within:ring-1 transition-shadow",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    style={{ height: resolvedHeight }}
                >
                    <input
                        inputMode="numeric"
                        placeholder="ชม."
                        value={hour}
                        disabled={disabled}
                        onChange={(e) => handleHourChange(e.target.value)}
                        className="w-10 text-center outline-none"
                    />
                    <span className="text-gray-500 select-none">:</span>
                    <input
                        inputMode="numeric"
                        placeholder="นาที"
                        value={minute}
                        disabled={disabled}
                        onChange={(e) => handleMinuteChange(e.target.value)}
                        className="w-10 text-center outline-none"
                    />
                </div>
                <input
                    ref={hiddenTimeRef}
                    type="time"
                    className="sr-only"
                    onChange={handleHiddenTimeChange}
                />
                {hasValue && !disabled && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="ล้างเวลา"
                    >
                        <Icon icon="material-symbols:close" className="w-[20px] h-[20px]" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleClockClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={disabled}
                    aria-label="เลือกเวลา"
                >
                    <Icon icon="uil:clock" className="w-[22px] h-[22px]" />
                </button>
            </div>
        </div>
    );
};

export default BoxTimeInput;
