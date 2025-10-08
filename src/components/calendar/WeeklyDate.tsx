/*
 * File: WeeklyDate.tsx
 * Component: WeeklyDate (Client)
 * คำอธิบาย: ตัวเลือกช่วงวัน (Range) แบบอินไลน์ ใช้ react-datepicker + สไตล์จาก WeeklyDatePickerContainer
 * - รองรับ controlled/uncontrolled
 * - ปรับย่อชื่อวันเป็นไทย
 * - แปลงปีใน year dropdown เป็น พ.ศ. (patch แบบ scoped ผ่าน containerRef)
 * Input (Props): ดู WeeklyDateProps
 * Output: JSX ของอินไลน์ Range DatePicker
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    WeeklyWrapper,
    WeeklyDatePickerContainer,
} from "./styled/WeeklyDate.Styled";
import { subYears, addYears } from "date-fns";
import type { Locale } from "date-fns";
import { th as thLocale } from "date-fns/locale";

/** ---------- Props ---------- */
export type WeeklyDateProps = {
    /** ค่า (controlled) [start, end] */
    value?: [Date | null, Date | null];
    /** ค่าเริ่มต้น (uncontrolled) */
    defaultValue?: [Date | null, Date | null];
    /** เมื่อมีการเปลี่ยนช่วง */
    onChange?: (range: [Date | null, Date | null]) => void;
    /** เมื่อเลือกครบช่วง (ทั้ง start และ end ไม่เป็น null) */
    onRangeCommit?: (start: Date, end: Date) => void;

    /** ค่าช่วงอนุญาต (AD). ดีฟอลต์: วันนี้±(−15y, +2y) */
    minDate?: Date;
    maxDate?: Date;

    /** locale (ดีฟอลต์: th) */
    locale?: Locale;

    /** ปรับ offset พ.ศ. (ดีฟอลต์ 543) */
    beOffset?: number;
};

export const WeeklyDate: React.FC<WeeklyDateProps> = ({
    value,
    defaultValue = [null, null],
    onChange,
    onRangeCommit,
    minDate,
    maxDate,
    locale = thLocale,
    beOffset = 543,
}) => {
    // ---------- Range State: controlled/uncontrolled ----------
    const isControlled = value !== undefined;
    const [innerRange, setInnerRange] =
        useState<[Date | null, Date | null]>(defaultValue);
    const [startDate, endDate] = isControlled
        ? (value as [Date | null, Date | null])
        : innerRange;

    // ---------- Date bounds ----------
    const today = useMemo(() => new Date(), []);
    const min = minDate ?? subYears(today, 15);
    const max = maxDate ?? addYears(today, 2);

    // ---------- Container Ref (for scoped DOM patch: BE year text) ----------
    const containerRef = useRef<HTMLDivElement>(null);

    /*
     * ฟังก์ชัน: setRangeSafe
     * คำอธิบาย : เซ็ตช่วงวันที่แบบรองรับ controlled/uncontrolled และ emit onChange/onRangeCommit
     * Input  : next: [Date|null, Date|null]
     * Output : void
     */
    const setRangeSafe = (next: [Date | null, Date | null]) => {
        if (!isControlled) setInnerRange(next);
        onChange?.(next);
        const [s, e] = next;
        if (s && e) onRangeCommit?.(s, e);
    };

    /*
     * ฟังก์ชัน: patchBEInYearDropdown
     * คำอธิบาย : ปรับข้อความปีใน year dropdown ให้เป็น พ.ศ. ภายในคอมโพเนนต์นี้เท่านั้น
     * Input  : none
     * Output : void
     */
    const patchBEInYearDropdown = () => {
        const root = containerRef.current;
        if (!root) return;
        const sel = root.querySelector(
            ".react-datepicker__year-select"
        ) as HTMLSelectElement | null;
        if (!sel) return;
        Array.from(sel.options).forEach((opt) => {
            const y = Number(opt.value);
            if (!Number.isNaN(y)) opt.textContent = String(y + beOffset);
        });
    };

    // เรียก patch เมื่อ mounted และเมื่อ state มีการเปลี่ยน (dropdown ถูก re-render)
    useEffect(() => {
        patchBEInYearDropdown();
    }, [startDate, endDate, beOffset, locale]);

    // ---------- Thai weekday short map ----------
    const weekdayShortTH: Record<string, string> = {
        อาทิตย์: "อา.",
        จันทร์: "จ.",
        อังคาร: "อ.",
        พุธ: "พ.",
        พฤหัสบดี: "พฤ.",
        ศุกร์: "ศ.",
        เสาร์: "ส.",
    };

    return (
        <WeeklyWrapper role="group" aria-label="เลือกช่วงวัน (สัปดาห์)">
            <WeeklyDatePickerContainer ref={containerRef}>
                <DatePicker
                    inline
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update: [Date | null, Date | null] | Date | null) => {
                        if (Array.isArray(update)) {
                            setRangeSafe(update as [Date | null, Date | null]);
                        }
                    }}
                    shouldCloseOnSelect={false}
                    formatWeekDay={(name) => weekdayShortTH[name] ?? name}
                    showPopperArrow={false}
                    locale={locale}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={min}
                    maxDate={max}
                />
            </WeeklyDatePickerContainer>
        </WeeklyWrapper>
    );
};
