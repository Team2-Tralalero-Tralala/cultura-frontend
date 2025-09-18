/* 
 * คำอธิบาย : Component สำหรับแสดงปุ่ม Trigger ของ Calendar 
 * โดยมีไอคอนปฏิทิน + ปุ่มเลือกโหมด (วัน, สัปดาห์, เดือน) 
 * และเมื่อกดจะแสดง CalendarPopover ตามโหมดที่เลือก
 */

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { CalendarPopover } from "./CalendarPopover";

/* 
 * Function: CalendarTrigger
 * Input : ไม่มี Props (internal state)
 * Output : JSX ของปุ่ม Trigger + Dropdown + CalendarPopover
 */
export const CalendarTrigger = () => {
    // State สำหรับควบคุมการเปิด/ปิด Popover
    const [isOpen, setIsOpen] = useState(false);

    // State สำหรับควบคุมการเปิด/ปิด Dropdown เลือกโหมด
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // State สำหรับเก็บโหมดปฏิทินที่เลือก (ค่าเริ่มต้น: weekly)
    const [type, setType] = useState<"daily" | "weekly" | "monthly">("weekly");

    const wrapperRef = useRef<HTMLDivElement>(null);

    // ปิดทุก popover/dropdown เมื่อคลิกข้างนอก component
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Label ของโหมดต่าง ๆ
    const typeLabel: Record<typeof type, string> = {
        daily: "วัน",
        weekly: "สัปดาห์",
        monthly: "เดือน",
    };

    return (
        <div ref={wrapperRef} className="relative inline-flex items-center gap-2">
            {/* ปุ่มไอคอนปฏิทิน */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-md hover:border-green-400 transition"
            >
                <Icon
                    icon="stash:data-date-duotone"
                    width="22"
                    height="22"
                />
            </button>

            {/* ปุ่มเลือกโหมด */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition
        ${isDropdownOpen ? "bg-[#34d399] text-white" : "bg-white text-gray-700 border-gray-200 shadow-md hover:border-[#34d399]"}`}
                >
                    <Icon icon="mynaui:filter" width="20" height="20" />
                    <span>{typeLabel[type]}</span>
                </button>

                {/* Dropdown เลือกโหมด */}
                {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-40 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                        {(["daily", "weekly", "monthly"] as const).map((option) => (
                            <div
                                key={option}
                                onClick={() => {
                                    setType(option);
                                    setIsDropdownOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer text-sm font-medium
                        ${type === option
                                        ? "bg-[#34d399] text-white"
                                        : "text-gray-700 hover:bg-green-100"
                                    }`}
                            >
                                {typeLabel[option]}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CalendarPopover */}
            {isOpen && <CalendarPopover type={type} />}
        </div>
    );
};
