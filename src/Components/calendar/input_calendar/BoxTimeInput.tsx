/*
 * File: BoxTimeInput.tsx
 * Component: BoxTimeInput (Client)
 *
 * Responsibility:
 *  - กล่องอินพุตเวลาแบบ 2 ช่อง (ชั่วโมง/นาที) รูปแบบ HH:mm
 *  - สไตล์เหมือน BoxDateInput (border, rounded, padding, font)
 *  - โค้ดให้เรียบง่าย ไม่ overengineer
 */

"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export type BoxTimeInputProps = {
    /** รูปแบบ "HH:mm" หรือ "" */
    value?: string;
    defaultValue?: string;
    onChange?: (time: string) => void;

    label?: React.ReactNode;
    required?: boolean;
    id?: string;
    disabled?: boolean;

    height?: number | string; // default: 44
    className?: string;

    /** ถ้ามี = ใช้แสดงและเปลี่ยน border เป็นแดง */
    errorText?: string;
};

const toCssSize = (v?: number | string) =>
    v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

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

    // สองช่อง ชม./นาที
    const [hh, setHh] = useState("");
    const [mm, setMm] = useState("");
    const hiddenTimeRef = useRef<HTMLInputElement | null>(null);

    const handleClockClick = () => {
        if (!hiddenTimeRef.current) return;

        // sync ค่าปัจจุบันจาก hh:mm ให้เป็น value "HH:mm"
        const currentTime =
            hh.length === 2 && mm.length === 2 ? `${hh}:${mm}` : "";

        hiddenTimeRef.current.value = currentTime;

        // ถ้า browser รองรับ showPicker (Chrome/Edge ใหม่ ๆ)
        if (hiddenTimeRef.current.showPicker) {
            hiddenTimeRef.current.showPicker();
        } else {
            // fallback อย่างน้อยก็โฟกัสไปที่มัน
            hiddenTimeRef.current.focus();
            hiddenTimeRef.current.click();
        }
    };

    const handleHiddenTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; // "HH:mm" หรือ ""
        if (!val) {
            setHh("");
            setMm("");
            emitChange("");
            return;
        }
        const [h, m] = val.split(":");
        setHh(h ?? "");
        setMm(m ?? "");
        emitChange(val);
    };


    const hasError = Boolean(errorText);
    const hasValue = Boolean(hh || mm);
    const resolvedHeight = toCssSize(height) ?? "44px";

    // ดึงค่าจาก value/defaultValue → แยกเป็น hh:mm
    useEffect(() => {
        const time = (value ?? defaultValue ?? "") as string;
        if (!time) {
            setHh("");
            setMm("");
            return;
        }
        const [h, m] = time.split(":");
        setHh(h ?? "");
        setMm(m ?? "");
    }, [value, defaultValue]);

    const emitChange = (next: string) => {
        onChange?.(next);
    };

    const cleanDigits = (v: string) => v.replace(/\D+/g, "").slice(0, 2);

    const handleHourChange = (raw: string) => {
        const digits = cleanDigits(raw);
        setHh(digits);
        if (digits.length === 2 && mm.length === 2) {
            emitChange(`${digits}:${mm}`);
        } else {
            emitChange("");
        }
    };

    const handleMinuteChange = (raw: string) => {
        const digits = cleanDigits(raw);
        setMm(digits);
        if (hh.length === 2 && digits.length === 2) {
            emitChange(`${hh}:${digits}`);
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
            {label && (
                <label htmlFor={inputId} className="text-base font-semibold pl-0.5">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}

            <div className="relative mt-1">
                {/* กล่องหลัก – หน้าตาเหมือนของเดิม */}
                <div
                    id={inputId}
                    className={[
                        "block w-full rounded-form border-1 px-5 py-2 pr-10",
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
                    {/* HH */}
                    <input
                        inputMode="numeric"
                        placeholder="ชม."
                        value={hh}
                        disabled={disabled}
                        onChange={(e) => handleHourChange(e.target.value)}
                        className="w-10 text-center outline-none"
                    />

                    <span className="text-gray-500 select-none">:</span>

                    {/* mm */}
                    <input
                        inputMode="numeric"
                        placeholder="นาที"
                        value={mm}
                        disabled={disabled}
                        onChange={(e) => handleMinuteChange(e.target.value)}
                        className="w-10 text-center outline-none"
                    />
                </div>

                {/* input type="time" แบบซ่อน ใช้สำหรับเรียก time picker */}
                <input
                    ref={hiddenTimeRef}
                    type="time"
                    className="sr-only"
                    onChange={handleHiddenTimeChange}
                    // ถ้าอยากกำหนด step เป็นนาที/วินาที ก็ใส่เพิ่มได้ เช่น step={60}
                />

                {/* ปุ่มล้างค่า */}
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

                {/* ไอคอนนาฬิกา (ตกแต่ง) */}
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
