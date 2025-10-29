/* 
 * File: DailyDate.tsx
 * Component: DailyDate (Client)
 * คำอธิบาย: ปฏิทินรายวันแบบอินไลน์ (react-datepicker) แสดงเดือนไทย + ปี พ.ศ.
 *            ใช้สไตล์จาก DailyDatePickerContainer และแพตช์ year dropdown เป็น พ.ศ.
 * Input (Props): -
 * Output: JSX อินไลน์เดตพิกเกอร์ (state ภายใน)
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    DailyWrapper,
    DailyDatePickerContainer,
} from "./styled/DailyDate.Styled";
import { subYears, addYears } from "date-fns";
import { th } from "date-fns/locale";

/*
 * ฟังก์ชัน/คงที่: weekdayShortTH
 * คำอธิบาย : map ย่อชื่อวันให้สั้นแบบไทย
 * Output    : Record<string,string>
 */
const weekdayShortTH: Record<string, string> = {
    "อาทิตย์": "อา.",
    "จันทร์": "จ.",
    "อังคาร": "อ.",
    "พุธ": "พ.",
    "พฤหัสบดี": "พฤ.",
    "ศุกร์": "ศ.",
    "เสาร์": "ส.",
};

/*
 * ฟังก์ชัน: DailyDate
 * คำอธิบาย : แสดงปฏิทินรายวัน (inline) พร้อมเดือนไทยและปี พ.ศ.
 * Input  : -
 * Output : JSX ของ react-datepicker (inline)
 */
export const DailyDate: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const today = useMemo(() => new Date(), []);
    const containerRef = useRef<HTMLDivElement>(null);

    /*
     * ฟังก์ชัน: patchBEYearDropdown
     * คำอธิบาย : ปรับข้อความปีใน year dropdown ให้เป็น พ.ศ. (จำกัดขอบเขตใน component ตัวเอง)
     * Input  : -
     * Output : void
     */
    const patchBEYearDropdown = () => {
        const root = containerRef.current;
        if (!root) return;
        const selectEl = root.querySelector(".react-datepicker__year-select") as HTMLSelectElement | null;
        if (!selectEl) return;
        Array.from(selectEl.options).forEach((opt) => {
            const y = Number(opt.value);
            if (!Number.isNaN(y)) opt.textContent = String(y + 543);
        });
    };

    // เรียกแพตช์ตอน mount และเมื่อ header ถูก re-render จากการเปลี่ยนเดือน/ปี (selectedDate)
    useEffect(() => {
        patchBEYearDropdown();
    }, [selectedDate]);

    return (
        <DailyWrapper>
            <DailyDatePickerContainer ref={containerRef}>
                <DatePicker
                    inline
                    selected={selectedDate ?? undefined}
                    onChange={(d: Date | null) => setSelectedDate(d)}
                    dateFormat="dd/MM/yyyy"
                    isClearable={false}
                    shouldCloseOnSelect={false}
                    formatWeekDay={(name) => weekdayShortTH[name] ?? name}
                    locale={th}               /* เดือนไทยจาก locale */
                    showMonthDropdown
                    showYearDropdown          /* ปีใน dropdown ถูกแปลงเป็น พ.ศ. ด้วย patch */
                    dropdownMode="select"
                    minDate={subYears(today, 15)}
                    maxDate={addYears(today, 2)}
                />
            </DailyDatePickerContainer>
        </DailyWrapper>
    );
};
