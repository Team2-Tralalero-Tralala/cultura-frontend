/* 
 * File: DailyDate.tsx
 * Component: DailyDate (Client)
 * มาตรฐาน: CS v1.1.1 (คอมเมนต์ไทย, ชื่อตัวแปร camelCase, ชื่อ Component เป็น PascalCase)
 * บทบาท:
 *   - ปฏิทินรายวันแบบอินไลน์ด้วย react-datepicker
 *   - ใช้ locale ภาษาไทย (เดือน/วัน) และแพตช์ year dropdown ให้แสดงปี พ.ศ.
 * ขอบเขต/ข้อกำหนด:
 *   - ไม่แก้ไข logic การทำงานเดิม เพิ่มเฉพาะคอมเมนต์และปรับชื่อให้สื่อความหมาย
 *   - ไม่มี any ในซิกเนเจอร์สาธารณะ/คอมโพเนนต์
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

/* ---------- Constants ---------- */
/*
 * คงที่: thaiWeekdayShortMap
 * คำอธิบาย: แผนที่ชื่อวัน (ไทยแบบเต็ม) → ชื่อย่อไทย สำหรับแสดงหัวคอลัมน์วัน
 */
const thaiWeekdayShortMap: Record<string, string> = {
    อาทิตย์: "อา.",
    จันทร์: "จ.",
    อังคาร: "อ.",
    พุธ: "พ.",
    พฤหัสบดี: "พฤ.",
    ศุกร์: "ศ.",
    เสาร์: "ส.",
};

/* ---------- Component ---------- */
/*
 * คอมโพเนนต์: DailyDate
 * คำอธิบาย: ปฏิทินรายวันอินไลน์ พร้อมเดือนไทยและปี พ.ศ. (ผ่านการแพตช์ dropdown)
 */
export const DailyDate: React.FC = () => {
    // วันที่ที่เลือก (ค่าเริ่มต้น: วันนี้)
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // อ้างอิง "วันนี้" แบบคงที่ตลอดอายุคอมโพเนนต์
    const today = useMemo(() => new Date(), []);

    // อ้างอิง DOM ของคอนเทนเนอร์ react-datepicker เพื่อแพตช์ dropdown ปี
    const datepickerContainerRef = useRef<HTMLDivElement>(null);

    /**
     * ฟังก์ชัน: patchBuddhistEraYearDropdown
     * คำอธิบาย: ปรับข้อความปีใน year dropdown ของ react-datepicker เป็นปี พ.ศ. (+543)
     * ขอบเขต: จำกัดผลเฉพาะภายในคอนเทนเนอร์ของคอมโพเนนต์นี้
     * Output : void
     */
    const patchBuddhistEraYearDropdown = (): void => {
        const root = datepickerContainerRef.current;
        if (!root) return;

        const yearSelect = root.querySelector(
            ".react-datepicker__year-select"
        ) as HTMLSelectElement | null;

        if (!yearSelect) return;

        Array.from(yearSelect.options).forEach((opt) => {
            const gregorian = Number(opt.value);
            if (!Number.isNaN(gregorian)) {
                opt.textContent = String(gregorian + 543);
            }
        });
    };

    /*
     * Effect: เรียกแพตช์เมื่อ mount และทุกครั้งที่ selectedDate เปลี่ยน
     * เหตุผล: หัวตารางของ react-datepicker ถูก re-render เมื่อเดือน/ปีเปลี่ยน
     */
    useEffect(() => {
        patchBuddhistEraYearDropdown();
    }, [selectedDate]);

    /* ---------- Render ---------- */
    return (
        <DailyWrapper>
            <DailyDatePickerContainer ref={datepickerContainerRef}>
                <DatePicker
                    inline
                    selected={selectedDate ?? undefined}
                    onChange={(nextDate: Date | null) => setSelectedDate(nextDate)}
                    dateFormat="dd/MM/yyyy"
                    isClearable={false}
                    shouldCloseOnSelect={false}
                    /* แปลงชื่อวันเป็นตัวย่อไทย (fallback เป็นค่าดั้งเดิมหากหาไม่เจอ) */
                    formatWeekDay={(weekdayName: string) =>
                        thaiWeekdayShortMap[weekdayName] ?? weekdayName
                    }
                    /* เดือนไทย/รูปแบบภาษาด้วย locale TH */
                    locale={th}
                    /* แสดง dropdown เดือน/ปี (ปีจะถูกแพตช์เป็น พ.ศ.) */
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    /* จำกัดช่วงวันที่เลือกได้ (ย้อนหลัง 15 ปี ถึงล่วงหน้า 2 ปี) */
                    minDate={subYears(today, 15)}
                    maxDate={addYears(today, 2)}
                />
            </DailyDatePickerContainer>
        </DailyWrapper>
    );
};
