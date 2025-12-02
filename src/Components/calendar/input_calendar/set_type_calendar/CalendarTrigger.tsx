/*
 * File: CalendarTrigger.tsx
 * Component: CalendarTrigger (Client)
 * หน้าที่:
 *   - ปุ่ม Trigger เปิด/ปิดปฏิทิน และปุ่มเลือกโหมด (รายสัปดาห์/รายเดือน/รายปี)
 *   - ปรับตำแหน่ง Popover อัตโนมัติ (Smart Positioning) ให้ไม่ล้นขอบขวา
 * อินพุต: -
 * เอาต์พุต:
 *   - กลุ่มปุ่ม + Popover ปฏิทิน (ไม่บล็อกโฟกัสทั้งหน้า)
 */

import React, { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { CalendarPopover } from "./CalendarPopover";

/** ---------- Types ---------- */
/*
 * ชนิด: CalendarMode
 * คำอธิบาย: โหมดปฏิทินที่รองรับ (คงรูปแบบให้สอดคล้องกับ CalendarPopover)
 */
type CalendarMode = "weekly" | "monthly" | "yearly";

/** ---------- Component ---------- */
export const CalendarTrigger: React.FC = () => {
    /* ========== UI State ========== */
    /** สถานะเปิด/ปิด Popover ปฏิทิน */
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    /** สถานะเปิด/ปิด Dropdown เลือกโหมด */
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

    /* ========== Alignment State ========== */
    /** ตำแหน่งยึดของ Popover (ชิดซ้าย/ขวา) */
    const [popoverAlign, setPopoverAlign] = useState<"left" | "right">("left");

    /* ========== Selection State ========== */
    /** โหมดปฏิทินที่เลือก (ดีฟอลต์รายสัปดาห์) */
    const [calendarMode, setCalendarMode] = useState<CalendarMode>("weekly");

    /* ========== Refs & IDs ========== */
    /** ครอบองค์ประกอบทั้งหมดสำหรับตรวจคลิกนอก */
    const wrapperRef = useRef<HTMLDivElement>(null);
    /** ไอดีสุ่มสำหรับผูก aria-* */
    const autoId = useId();
    const modeMenuId = `calendar-mode-menu-${autoId}`;
    const triggerButtonId = `calendar-trigger-btn-${autoId}`;
    const modeButtonId = `calendar-mode-btn-${autoId}`;

    /* ========== Smart Positioning Logic ========== */
    /*
     * คำอธิบาย:
     *   - เมื่อเปิด Popover จะตรวจพื้นที่ด้านขวาของปุ่ม
     *   - ถ้าพื้นที่ว่างด้านขวาน้อยกว่า 350px ให้จัด Popover ไปชิดขวา
     * หมายเหตุ:
     *   - เลือกใช้ useLayoutEffect เพื่อคำนวณบนเฟรมเดียวกับการเพนต์ ลดอาการกระพริบ
     */
    useLayoutEffect(() => {
        if (isPopoverOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const spaceRight = screenWidth - rect.left;

            if (spaceRight < 350) setPopoverAlign("right");
            else setPopoverAlign("left");
        }
    }, [isPopoverOpen]);

    /* ========== Outside Click ========== */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsPopoverOpen(false);
                setIsModeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ========== Escape Close ========== */
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsPopoverOpen(false);
                setIsModeDropdownOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    /* ========== Label Map (ตามโหมด) ========== */
    const modeLabelMap: Record<CalendarMode, string> = {
        weekly: "รายสัปดาห์",
        monthly: "รายเดือน",
        yearly: "รายปี",
    };

    return (
        <div ref={wrapperRef} className="relative inline-flex items-center gap-2 m-2">
            {/* ปุ่มไอคอนปฏิทิน (Trigger) */}
            <button
                id={triggerButtonId}
                type="button"
                onClick={() => setIsPopoverOpen((v) => !v)}
                className="w-[34px] h-[39px] flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-md hover:border-green-400 transition"
                aria-label="เปิดปฏิทิน"
                aria-expanded={isPopoverOpen}
                aria-controls={`calendar-popover-${autoId}`}
            >
                <Icon icon="stash:data-date-duotone" className="h-[22.67px] w-[22.67px]" />
            </button>

            {/* ปุ่มเลือกโหมด (Weekly / Monthly / Yearly) */}
            <div className="relative">
                <button
                    id={modeButtonId}
                    type="button"
                    onClick={() => setIsModeDropdownOpen((v) => !v)}
                    className={`inline-flex w-[130px] h-[39px] items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition
            ${isModeDropdownOpen
                            ? "bg-[#34d399] text-white"
                            : "bg-white text-gray-700 border-gray-200 shadow-md hover:border-[#34d399]"
                        }`}
                    aria-haspopup="menu"
                    aria-expanded={isModeDropdownOpen}
                    aria-controls={modeMenuId}
                >
                    <Icon icon="mynaui:filter" className="h-[22.67px] w-[22.67px]" />
                    <span>{modeLabelMap[calendarMode]}</span>
                </button>

                {/* Dropdown เลือกโหมด */}
                {isModeDropdownOpen && (
                    <div
                        id={modeMenuId}
                        role="menu"
                        className="absolute left-0 top-full mt-2 w-40 rounded-2xl bg-white shadow-lg overflow-hidden z-50"
                    >
                        {(["weekly", "monthly", "yearly"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    setCalendarMode(option);
                                    setIsModeDropdownOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm font-medium ${calendarMode === option
                                        ? "bg-[#34d399] text-white"
                                        : "text-gray-700 hover:bg-green-100"
                                    }`}
                            >
                                {modeLabelMap[option]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* CalendarPopover Wrapper
         หมายเหตุ: คลาส 'right-115' เป็นยูทิลิตีแบบกำหนดเอง (ถ้ามี)
         - ถ้าไม่ได้กำหนดใน Tailwind config ให้เปลี่ยนเป็น 'right-0' หรือกำหนดคลาสเองภายหลัง */}
            {isPopoverOpen && (
                <div
                    id={`calendar-popover-${autoId}`}
                    className={`absolute top-full z-50 ${popoverAlign === "right" ? "right-112" : "left-0"
                        }`}
                >
                    {/* ส่งโหมดที่เลือกไปยังปฏิทิน */}
                    <CalendarPopover type={calendarMode} />
                </div>
            )}
        </div>
    );
};
