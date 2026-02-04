/*
 * File: WeeklyDate.tsx
 * Component: WeeklyDate (Client)
 * หน้าที่:
 *   - ปฏิทินเลือกช่วงวันแบบ “รายสัปดาห์” (Auto-select 7 วัน): คลิกวันเริ่มแล้วระบบเติมวันสิ้นสุด = เริ่ม + 6 วัน
 *   - ใช้สไตล์จาก WeeklyDatePickerContainer (Start=เขียวเข้ม, In-Range=เขียวอ่อน, ต่อเป็น pill)
 * อินพุต (Props):
 *   - value?: [Date|null, Date|null]              // โหมดควบคุมจากภายนอก (controlled)
 *   - defaultValue?: [Date|null, Date|null]       // ค่าเริ่มต้นภายใน (uncontrolled)
 *   - onChange?: (range) => void                  // ยิงเมื่อมีการเปลี่ยนช่วง (start/end)
 *   - onRangeCommit?: (start, end) => void        // ยิงเมื่อเลือกครบช่วง (start & end ไม่เป็น null)
 *   - minDate?: Date, maxDate?: Date              // ขอบเขตวันที่โดยรวม (AD)
 *   - locale?: Locale                             // ดีฟอลต์: ไทย (th)
 *   - buddhistEraOffset?: number                  // ออฟเซ็ต พ.ศ. สำหรับ dropdown ปี (ดีฟอลต์ 543)
 * เอาท์พุต:
 *   - JSX: WeeklyWrapper + WeeklyDatePickerContainer + react-datepicker โหมด selectsRange
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    WeeklyWrapper,
    WeeklyDatePickerContainer,
} from "./styled/WeeklyDate.Styled";
import { subYears, addYears, addDays } from "date-fns";
import type { Locale } from "date-fns";
import { th as thLocale } from "date-fns/locale";

/** ---------- Props ---------- */
export type WeeklyDateProps = {
    /** ค่า (controlled) [start, end] */
    value?: [Date | null, Date | null];
    /** ค่าเริ่มต้น (uncontrolled) */
    defaultValue?: [Date | null, Date | null];
    /** ยิงเมื่อมีการเปลี่ยนช่วง */
    onChange?: (range: [Date | null, Date | null]) => void;
    /** ยิงเมื่อเลือกครบช่วง (ทั้ง start และ end ไม่เป็น null) */
    onRangeCommit?: (start: Date, end: Date) => void;

    /** ค่าช่วงอนุญาต (AD). ดีฟอลต์: วันนี้±(−15y, +2y) */
    minDate?: Date;
    maxDate?: Date;

    /** locale (ดีฟอลต์: th) */
    locale?: Locale;

    /** ออฟเซ็ตปี พ.ศ. ที่ใช้แสดงใน year dropdown (ดีฟอลต์ 543) */
    buddhistEraOffset?: number;
};

/** ---------- Component ---------- */
export const WeeklyDate: React.FC<WeeklyDateProps> = ({
    value,
    defaultValue = [null, null],
    onChange,
    onRangeCommit,
    minDate,
    maxDate,
    locale = thLocale,
    buddhistEraOffset = 543,
}) => {
    /** ---------- Range State: controlled/uncontrolled ---------- */
    const isControlled = value !== undefined;
    const [innerRange, setInnerRange] = useState<[Date | null, Date | null]>(
        defaultValue
    );

    /** ค่าที่ใช้จริง (ขึ้นกับโหมดควบคุม) */
    const [startDate, endDate] = isControlled
        ? (value as [Date | null, Date | null])
        : innerRange;

    /** ---------- Date bounds (Global) ---------- */
    const today = useMemo(() => new Date(), []);
    const globalMin = minDate ?? subYears(today, 15);
    const globalMax = maxDate ?? addYears(today, 2);

    /** ---------- Container Ref (ใช้แพตช์ year dropdown เป็น พ.ศ.) ---------- */
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * ฟังก์ชัน: handleAutoSelectWeek
     * คำอธิบาย: คลิกวันที่เริ่ม → สร้างช่วง 7 วันอัตโนมัติ (start → start+6)
     * หมายเหตุ: ไม่แก้ logic เพิ่มเติม (ไม่ clamp กับ globalMax)
     */
    const handleAutoSelectWeek = (
        dates: [Date | null, Date | null] | Date | null
    ) => {
        if (Array.isArray(dates)) {
            const [selectedStart] = dates;
            if (selectedStart) {
                const autoEnd = addDays(selectedStart, 6);
                const nextRange: [Date | null, Date | null] = [selectedStart, autoEnd];

                // อัปเดต state (เฉพาะ uncontrolled)
                if (!isControlled) setInnerRange(nextRange);

                // ยิง callback
                onChange?.(nextRange);
                if (onRangeCommit) onRangeCommit(selectedStart, autoEnd);
            }
        }
    };

    /**
     * ฟังก์ชัน: patchBuddhistEraYearDropdown
     * คำอธิบาย: ปรับข้อความใน year dropdown ให้แสดงเป็น พ.ศ. โดยเพิ่ม buddhistEraOffset
     * ขอบเขตผล: จำกัดภายใต้ containerRef (ไม่กระทบคอมโพเนนต์อื่น)
     */
    const patchBuddhistEraYearDropdown = () => {
        const root = containerRef.current;
        if (!root) return;
        const yearSelectEl = root.querySelector(
            ".react-datepicker__year-select"
        ) as HTMLSelectElement | null;
        if (!yearSelectEl) return;

        Array.from(yearSelectEl.options).forEach((optionEl) => {
            const yearCE = Number(optionEl.value);
            if (!Number.isNaN(yearCE)) optionEl.textContent = String(yearCE + buddhistEraOffset);
        });
    };

    // เรียกแพตช์เมื่อ header ถูก re-render จากการเปลี่ยน start/end/locale/offset
    useEffect(() => {
        patchBuddhistEraYearDropdown();
    }, [startDate, endDate, buddhistEraOffset, locale]);

    /** ป้ายย่อชื่อวันแบบไทยสำหรับหัวคอลัมน์ (อา.–ส.) */
    const weekdayShortThMap: Record<string, string> = {
        อาทิตย์: "อา.",
        จันทร์: "จ.",
        อังคาร: "อ.",
        พุธ: "พ.",
        พฤหัสบดี: "พฤ.",
        ศุกร์: "ศ.",
        เสาร์: "ส.",
    };

    /** ---------- Render ---------- */
    return (
        <WeeklyWrapper role="group" aria-label="เลือกช่วงวัน (สัปดาห์)">
            {/* หมายเหตุด้าน A11y:
          - role="group" + aria-label ระบุกลุ่มคอนโทรล
          - ไม่ปิดป๊อปโอเวอร์อัตโนมัติ (shouldCloseOnSelect=false) เพื่อให้เห็นช่วงครบชัดเจน
      */}
            <WeeklyDatePickerContainer ref={containerRef}>
                <DatePicker
                    inline
                    selectsRange
                    startDate={startDate ?? undefined}
                    endDate={endDate ?? undefined}
                    onChange={handleAutoSelectWeek} /* เลือก 7 วันอัตโนมัติ */
                    shouldCloseOnSelect={false}
                    formatWeekDay={(name: string) => weekdayShortThMap[name] ?? name}
                    showPopperArrow={false}
                    locale={locale}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={globalMin}
                    maxDate={globalMax}
                />
            </WeeklyDatePickerContainer>
        </WeeklyWrapper>
    );
};
