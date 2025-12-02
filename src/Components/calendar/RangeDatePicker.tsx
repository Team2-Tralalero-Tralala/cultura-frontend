/*
 * File: RangeDatePicker.tsx
 * Component: RangeDatePicker (Client)
 * หน้าที่:
 *   - เลือก “ช่วงวัน” แบบอินไลน์ สูงสุด 7 วัน (เริ่มวันแรก → สิ้นสุดภายในอีก 6 วัน)
 *   - เมื่อเลือกวันแรก วันนอกขอบเขต 7 วัน (หรือเกิน global max) จะถูก disable และจางลง (CSS inject)
 * อินพุต (Props):
 *   - value?: [Date|null, Date|null]           // ควบคุมจากภายนอก (controlled)
 *   - defaultValue?: [Date|null, Date|null]    // ค่าเริ่มต้น (uncontrolled)
 *   - onChange?: (range) => void               // ยิงเมื่อมีการเปลี่ยนช่วง (start/end)
 *   - onRangeCommit?: (start, end) => void     // ยิงเมื่อเลือกครบทั้ง start + end
 *   - minDate?: Date, maxDate?: Date           // ขอบเขตโดยรวม (global limits)
 *   - locale?: Locale (default: th)
 *   - buddhistEraOffset?: number (default: 543) // ออฟเซ็ตปี พ.ศ. (ใช้กับ dropdown ปี)
 * เอาท์พุต:
 *   - JSX: WeeklyDatePickerContainer + react-datepicker โหมด selectsRange
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

/** ---------- Types: Props ---------- */
export type RangeDatePickerProps = {
    value?: [Date | null, Date | null];
    defaultValue?: [Date | null, Date | null];
    onChange?: (range: [Date | null, Date | null]) => void;
    onRangeCommit?: (start: Date, end: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    locale?: Locale;
    buddhistEraOffset?: number;
};

/** ---------- Component ---------- */
export const RangeDatePicker: React.FC<RangeDatePickerProps> = ({
    value,
    defaultValue = [null, null],
    onChange,
    onRangeCommit,
    minDate,
    maxDate,
    locale = thLocale,
    buddhistEraOffset = 543,
}) => {
    /** สถานะภายใน/ภายนอก (controlled vs uncontrolled) */
    const isControlled = value !== undefined;
    const [innerRange, setInnerRange] = useState<[Date | null, Date | null]>(
        defaultValue
    );

    /** ช่วงวันที่ปัจจุบัน (อ้างอิงจากโหมดควบคุม) */
    const [startDate, endDate] = isControlled
        ? (value as [Date | null, Date | null])
        : innerRange;

    /** ขอบเขตวันที่รวม (ย้อนหลัง 15 ปี ถึง ล่วงหน้า 2 ปี) */
    const today = useMemo(() => new Date(), []);
    const globalMin = minDate ?? subYears(today, 15);
    const globalMax = maxDate ?? addYears(today, 2);

    /**
     * ขอบเขตแบบไดนามิก:
     * - เมื่อเลือก start แล้ว (แต่ยังไม่เลือก end): ล็อก min = start, max = start+6 วัน (ไม่เกิน globalMax)
     * - กรณีอื่น ๆ: ใช้ globalMin/globalMax ตามปกติ
     */
    const { dynamicMin, dynamicMax } = useMemo(() => {
        if (startDate && !endDate) {
            const limitMin = startDate;
            const limitMax = addDays(startDate, 6);
            return {
                dynamicMin: limitMin,
                dynamicMax: limitMax > globalMax ? globalMax : limitMax,
            };
        }
        return { dynamicMin: globalMin, dynamicMax: globalMax };
    }, [startDate, endDate, globalMin, globalMax]);

    /** อ้างอิงคอนเทนเนอร์ (ใช้แพตช์ dropdown ปีเป็น พ.ศ.) */
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * ฟังก์ชัน: setRangeSafe
     * คำอธิบาย: อัปเดตช่วงวัน (รองรับทั้ง controlled/uncontrolled) และยิง onChange/onRangeCommit ให้ครบ
     */
    const setRangeSafe = (nextRange: [Date | null, Date | null]) => {
        if (!isControlled) setInnerRange(nextRange);
        onChange?.(nextRange);

        const [start, end] = nextRange;
        if (start && end) onRangeCommit?.(start, end);
    };

    /**
     * ฟังก์ชัน: patchBuddhistEraYearDropdown
     * คำอธิบาย: แก้ไขข้อความรายการปีใน year dropdown ให้แสดงเป็น “พ.ศ.” โดยเพิ่ม buddhistEraOffset
     * หมายเหตุ: จำกัดขอบเขตผลเฉพาะในคอมโพเนนต์ (query ใต้ containerRef เท่านั้น)
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
            if (!Number.isNaN(yearCE)) {
                optionEl.textContent = String(yearCE + buddhistEraOffset);
            }
        });
    };

    // เรียกแพตช์เมื่อ header re-render จากการเปลี่ยน start/end/locale/offset
    useEffect(() => {
        patchBuddhistEraYearDropdown();
    }, [startDate, endDate, buddhistEraOffset, locale]);

    /** ป้ายย่อชื่อวันแบบไทยสำหรับส่วนหัวคอลัมน์ */
    const weekdayShortThMap: Record<string, string> = {
        อาทิตย์: "อา.",
        จันทร์: "จ.",
        อังคาร: "อ.",
        พุธ: "พ.",
        พฤหัสบดี: "พฤ.",
        ศุกร์: "ศ.",
        เสาร์: "ส.",
    };

    /* ---------- Render ---------- */
    return (
        <WeeklyWrapper role="group" aria-label="เลือกช่วงวัน (สูงสุด 7 วัน)">
            {/* [CSS Injection] ทำให้วันที่ disabled ดูจางลง + ป้องกันคลิก */}
            <style>{`
        .react-datepicker__day--disabled {
          opacity: 0.2 !important;
          filter: grayscale(100%);
          cursor: not-allowed;
        }
        .react-datepicker__day:not(.react-datepicker__day--disabled) {
          opacity: 1 !important;
          font-weight: 400;
        }
      `}</style>

            <WeeklyDatePickerContainer ref={containerRef}>
                <DatePicker
                    inline
                    selectsRange
                    startDate={startDate ?? undefined}
                    endDate={endDate ?? undefined}
                    onChange={(update: [Date | null, Date | null] | Date | null) => {
                        if (Array.isArray(update)) {
                            setRangeSafe(update as [Date | null, Date | null]);
                        }
                    }}
                    shouldCloseOnSelect={false}
                    formatWeekDay={(name: string) => weekdayShortThMap[name] ?? name}
                    showPopperArrow={false}
                    locale={locale}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    /* จำกัดช่วงที่เลือกได้ (ให้ react-datepicker ใส่ class --disabled ให้โดยอัตโนมัติ) */
                    minDate={dynamicMin}
                    maxDate={dynamicMax}
                />
            </WeeklyDatePickerContainer>
        </WeeklyWrapper>
    );
};
