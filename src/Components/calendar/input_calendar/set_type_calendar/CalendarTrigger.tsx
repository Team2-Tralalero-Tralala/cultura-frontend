/*
 * Component: CalendarTrigger (Client)
 * คำอธิบาย: ปุ่ม Trigger สำหรับเปิดปฏิทิน พร้อมปุ่มเลือกโหมด (วัน/สัปดาห์/เดือน)
 *            เมื่อกดจะเปิด CalendarPopover ตามโหมดที่เลือก
 * Input (Props): ไม่มี (internal state) — สามารถยกระดับภายหลังโดยเพิ่ม onOpenChange/onTypeChange ได้
 * Output: JSX ปุ่มไอคอน + ปุ่มโหมด + Popover ปฏิทิน
 * หมายเหตุ: คอมเมนต์ไฟล์/ฟังก์ชันตามมาตรฐาน CS
 */

import React, { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { CalendarPopover } from "./CalendarPopover";

/** ---------- Types ---------- */
/*
 * ชนิด: CalendarMode
 * คำอธิบาย: โหมดของปฏิทินที่รองรับ
 */
type CalendarMode = "daily" | "weekly" | "monthly";

/** ---------- Component ---------- */
/*
 * ฟังก์ชัน: CalendarTrigger
 * คำอธิบาย : แสดงปุ่มเปิดปฏิทิน + ปุ่มเลือกโหมด และควบคุมการเปิด/ปิด popover/dropdown
 * Input  : (none)
 * Output : JSX ของปุ่ม Trigger + Dropdown (โหมด) + CalendarPopover
 */
export const CalendarTrigger: React.FC = () => {
    // [UI State] เปิด/ปิดปฏิทิน และเมนูเลือกโหมด
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // [Selection State] โหมดปฏิทิน (ดีฟอลต์ weekly)
    const [type, setType] = useState<CalendarMode>("weekly");

    // [Refs & IDs]
    const wrapperRef = useRef<HTMLDivElement>(null);
    const autoId = useId();
    const menuId = `calendar-mode-menu-${autoId}`;
    const triggerId = `calendar-trigger-btn-${autoId}`;
    const modeBtnId = `calendar-mode-btn-${autoId}`;

    // [Outside Click] ปิด popover/dropdown เมื่อคลิกนอกคอมโพเนนต์
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

    // [Esc Close] ปิดด้วยปุ่ม Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsOpen(false);
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Label ของโหมดต่าง ๆ
    const typeLabel: Record<CalendarMode, string> = {
        daily: "รายวัน",
        weekly: "ช่วงเวลา",
        monthly: "รายเดือน",
    };

    return (
        <div ref={wrapperRef} className="relative inline-flex items-center gap-2 m-2">
            {/* ปุ่มไอคอนปฏิทิน */}
            <button
                id={triggerId}
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-[34px] h-[39px] flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-md hover:border-green-400 transition"
                aria-label="เปิดปฏิทิน"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={isOpen ? `calendar-popover-${autoId}` : undefined}
            >
                <Icon icon="stash:data-date-duotone" className="h-[22.67px] w-[22.67px]" />
            </button>

            {/* ปุ่มเลือกโหมด */}
            <div className="relative">
                <button
                    id={modeBtnId}
                    type="button"
                    onClick={() => setIsDropdownOpen((v) => !v)}
                    className={`inline-flex w-[120px] h-[39px] items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition
            ${isDropdownOpen ? "bg-[#34d399] text-white" : "bg-white text-gray-700 border-gray-200 shadow-md hover:border-[#34d399]"}`}
                    aria-label="เลือกโหมดปฏิทิน"
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    aria-controls={isDropdownOpen ? menuId : undefined}
                >
                    <Icon icon="mynaui:filter" className="h-[22.67px] w-[22.67px]" />
                    <span>{typeLabel[type]}</span>
                </button>

                {/* Dropdown เลือกโหมด */}
                {isDropdownOpen && (
                    <div
                        id={menuId}
                        role="menu"
                        aria-labelledby={modeBtnId}
                        className="absolute left-0 top-full mt-1 w-40 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
                    >
                        {(["daily", "weekly", "monthly"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                role="menuitemradio"
                                aria-checked={type === option}
                                onClick={() => {
                                    setType(option);
                                    setIsDropdownOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm font-medium ${type === option ? "bg-[#34d399] text-white" : "text-gray-700 hover:bg-green-100"
                                    }`}
                            >
                                {typeLabel[option]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* CalendarPopover */}
            {isOpen && (
                <div id={`calendar-popover-${autoId}`}>
                    <CalendarPopover type={type} />
                </div>
            )}
        </div>
    );
};
