/* 
 * คำอธิบาย : Component สำหรับ Input วันที่ 
 * แสดงเป็นช่อง input (ปุ่ม) พร้อม Calendar Popover แบบ Daily
 * ใช้ร่วมกับ Component <DailyDate /> 
 */

import React, { useState, useRef, useEffect } from "react";
import { DailyDate } from "../DailyDate";
import { Icon } from "@iconify/react";

/* 
 * Function: DailyDateInput
 * Input : ไม่มี Props (internal state)
 * Output : JSX ของ input เลือกวัน พร้อมปฏิทินแบบ Popover
 */
export const DailyDateInput = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-80">
            {/* Input ปุ่มเลือกวันที่ */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 flex items-center justify-between rounded-2xl border border-gray-500 px-4 py-2 bg-white cursor-pointer hover:border-[#34d399] transition"
            >
                <Icon
                    icon="quill:calendar"
                    width="30"
                    height="30"
                    className="text-gray-500"
                />
                <span className="flex-1 text-center text-gray-600">
                    {selectedDate || "เลือกวันที่"}
                </span>
            </div>

            {/* Calendar popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-20">
                    <DailyDate />
                </div>
            )}
        </div>
    );
};
