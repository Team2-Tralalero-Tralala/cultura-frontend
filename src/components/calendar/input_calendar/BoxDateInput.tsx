/*
 * File: BoxDateInput.tsx
 * Component: BoxDateInput (Client)
 * Standard: CS v1.1.1 (TH)
 * หน้าที่:
 *  - อินพุตวันที่ระบบ พ.ศ. แบบกล่องแยก (วัน/เดือน/ปี) + ปุ่มเปิดปฏิทิน
 *  - ตรวจรูปแบบ dd/MM/yyyy (BE) → แปลงเป็น Date(AD) พร้อมตรวจขอบเขต min/max (AD)
 *  - รองรับ controlled/uncontrolled, onTextCommit/onOpenChange สำหรับ hook ภายนอก
 * หมายเหตุ:
 *  - แก้เฉพาะ "ชื่อตัวแปร" ให้สื่อความหมาย + camelCase เท่านั้น (ไม่เปลี่ยนพฤติกรรมโค้ด)
 */

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DailyWrapper, DailyDatePickerContainer } from "../styled/DailyDate.Styled";
import { Icon } from "@iconify/react";
import { subYears, addYears } from "date-fns";
import type { Locale } from "date-fns";
import { th as thLocale } from "date-fns/locale";

/** ---------- Utils (Pure) ----------
 * ฟังก์ชันบริสุทธิ์สำหรับจัดรูปแบบ/แปลงปี พ.ศ. ↔ ค.ศ.
 */

/** เติมเลขให้ครบ 2 หลัก (01, 02, ... 31) */
const pad2 = (n: number) => n.toString().padStart(2, "0");

/** แปลง Date(AD) → สตริง พ.ศ. รูปแบบ dd/MM/yyyy (ถ้า null คืน "") */
const formatDateToBEString = (dateAD: Date | null, buddhistYearOffset = 543) =>
    dateAD ? `${pad2(dateAD.getDate())}/${pad2(dateAD.getMonth() + 1)}/${dateAD.getFullYear() + buddhistYearOffset}` : "";

/** แปลงสตริง dd/MM/yyyy(BE) → Date(AD) (ตรวจวัน/เดือน/ปีจริงด้วยการเทียบค่าที่ new Date คืนมา) */
const parseBE = (dateText: string, beOffset = 543): Date | null => {
    const matches = dateText.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!matches) return null;

    const dayNumber = +matches[1];
    const monthIndex = +matches[2] - 1; // 0-based
    const beYearNumber = +matches[3];
    const adYearNumber = beYearNumber - beOffset;

    const candidate = new Date(adYearNumber, monthIndex, dayNumber);
    const isValidDate =
        candidate.getFullYear() === adYearNumber &&
        candidate.getMonth() === monthIndex &&
        candidate.getDate() === dayNumber;

    return isValidDate ? candidate : null;
};

/** ---------- Props ---------- */
export type BoxDateInputProps = {
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (date: Date | null) => void;

    minDate?: Date;
    maxDate?: Date;

    label?: React.ReactNode;
    required?: boolean;

    name?: string;
    id?: string;
    disabled?: boolean;

    width?: number | string; // default 520
    height?: number | string; // default 44

    className?: string;
    inputClassName?: string; // not used in segmented boxes; kept for compat
    dropdownClassName?: string;
    calendarButtonClassName?: string;

    locale?: Locale; // default: Thai
    beOffset?: number; // default: 543
    placeholder?: string; // default: "วว/ดด/ปปปป"

    showMonthDropdown?: boolean; // default: true
    showYearDropdown?: boolean; // default: true
    yearDropdownMode?: "scroll" | "select"; // default: "select"

    autoCloseOnSelect?: boolean; // default: true
    onTextCommit?: (text: string, parsed: Date | null, inRange: boolean) => void;
    onOpenChange?: (open: boolean) => void;

    clearable?: boolean; // default: true
    onClear?: () => void;

    errorText?: string; // default: "รูปแบบวันที่ไม่ถูกต้อง"

    /** ใช้ segmented boxes แทน input เดียว */
    segmented?: boolean; // default: true
};

/** ---------- Component ---------- */
export const BoxDateInput: React.FC<BoxDateInputProps> = ({
    value,
    defaultValue = null,
    onChange,
    minDate,
    maxDate,
    label,
    required = false,
    name,
    id,
    disabled = false,
    width = 520,
    height = 44,
    className,
    inputClassName, // NOTE[compat]: ไม่ถูกใช้ในโหมด segmented
    dropdownClassName,
    calendarButtonClassName,
    locale = thLocale,
    beOffset = 543,
    placeholder = "วว/ดด/ปปปป",
    showMonthDropdown = true,
    showYearDropdown = true,
    yearDropdownMode = "select",
    autoCloseOnSelect = true,
    onTextCommit,
    onOpenChange,
    clearable = true,
    onClear,
    errorText = "รูปแบบวันที่ไม่ถูกต้อง",
    segmented = true,
}) => {
    /** ---------- ค่าเริ่มต้นช่วงวันที่ (AD) ---------- */
    const today = useMemo(() => new Date(), []);
    const minDateResolved = minDate ?? subYears(today, 15);
    const maxDateResolved = maxDate ?? addYears(today, 2);

    /** ---------- โหมด controlled/uncontrolled ---------- */
    const isControlled = value !== undefined;
    const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
    const selectedDate = isControlled ? (value as Date | null) : internalDate;

    /** ---------- สถานะ popover ---------- */
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /** ---------- A11y IDs ---------- */
    const autoId = useId();
    const inputId = id ?? `be-date-${autoId}`;
    const errorId = `${inputId}-err`;

    /** ---------- สถานะกล่องแยก (วัน/เดือน/ปี: BE) ---------- */
    const [dayText, setDayText] = useState<string>(selectedDate ? pad2(selectedDate.getDate()) : "");
    const [monthText, setMonthText] = useState<string>(selectedDate ? pad2(selectedDate.getMonth() + 1) : "");
    const [yearBeText, setYearBeText] = useState<string>(
        selectedDate ? String(selectedDate.getFullYear() + beOffset) : ""
    );

    const dayInputRef = useRef<HTMLInputElement | null>(null);
    const monthInputRef = useRef<HTMLInputElement | null>(null);
    const yearInputRef = useRef<HTMLInputElement | null>(null);

    type InputRef =
        | React.RefObject<HTMLInputElement | null>
        | React.MutableRefObject<HTMLInputElement | null>;

    /** ---------- ความถูกต้องของอินพุต ---------- */
    const [isValid, setIsValid] = useState(true);

    /** ---------- ปิดปฏิทินเมื่อคลิกนอก ---------- */
    useEffect(() => {
        const handleDocumentMouseDown = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsCalendarOpen(false);
                onOpenChange?.(false);
            }
        };
        document.addEventListener("mousedown", handleDocumentMouseDown);
        return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
    }, [onOpenChange]);

    /** ---------- sync state จาก selectedDate ---------- */
    useEffect(() => {
        if (!selectedDate) {
            setDayText("");
            setMonthText("");
            setYearBeText("");
            setIsValid(true);
            return;
        }
        setDayText(pad2(selectedDate.getDate()));
        setMonthText(pad2(selectedDate.getMonth() + 1));
        setYearBeText(String(selectedDate.getFullYear() + beOffset));
        setIsValid(true);
    }, [selectedDate, beOffset]);

    /** ---------- ปรับ year dropdown ของ react-datepicker ให้แสดงเป็น พ.ศ. ---------- */
    useEffect(() => {
        if (!isCalendarOpen || !showYearDropdown) return;
        const selectEl = wrapperRef.current?.querySelector(
            ".react-datepicker__year-select"
        ) as HTMLSelectElement | null;
        if (!selectEl) return;

        Array.from(selectEl.options).forEach((opt) => {
            const adYear = Number(opt.value);
            if (!Number.isNaN(adYear)) opt.textContent = String(adYear + beOffset);
        });
    }, [isCalendarOpen, selectedDate, showYearDropdown, beOffset]);

    /** ตั้งค่า selectedDate (รองรับ controlled/uncontrolled) */
    const setDateSafe = (dateValue: Date | null) => {
        if (!isControlled) setInternalDate(dateValue);
        onChange?.(dateValue);
    };

    /** รวมค่าสตริง BE จาก 3 กล่อง (ว่างถ้าขาดกล่องใดกล่องหนึ่ง) */
    const beDateText = () => (dayText && monthText && yearBeText ? `${dayText}/${monthText}/${yearBeText}` : "");

    /** คอมมิตค่าจากกล่องแยก → แปลงเป็น Date(AD) + ตรวจขอบเขต + แจ้งผล */
    const commitSegmentsToDate = () => {
        const combinedText = beDateText();
        if (!combinedText) {
            setIsValid(true);
            onTextCommit?.("", null, true);
            setDateSafe(null);
            return;
        }
        const parsed = parseBE(combinedText, beOffset);
        const inRange = !!parsed && parsed >= minDateResolved && parsed <= maxDateResolved;
        setIsValid(inRange);
        onTextCommit?.(combinedText, parsed, inRange);
        if (inRange) setDateSafe(parsed!);
    };

    /** ---------- Helpers สำหรับกล่องแยก ---------- */
    const extractDigits = (v: string) => v.replace(/\D+/g, "");

    const handleDayInput = (v: string) => {
        const nextValue = extractDigits(v).slice(0, 2);
        setDayText(nextValue);
        if (nextValue.length === 2) monthInputRef.current?.focus();
    };

    const handleMonthInput = (v: string) => {
        const nextValue = extractDigits(v).slice(0, 2);
        setMonthText(nextValue);
        if (nextValue.length === 2) yearInputRef.current?.focus();
    };

    const handleYearInput = (v: string) => {
        const nextValue = extractDigits(v).slice(0, 4);
        setYearBeText(nextValue);
    };

    /** Backspace ที่ตำแหน่งเริ่มต้น → โฟกัสกล่องก่อนหน้า */
    const handleBackspaceToPrev = (e: React.KeyboardEvent<HTMLInputElement>, prev?: InputRef) => {
        if (e.key === "Backspace") {
            const el = e.currentTarget as HTMLInputElement;
            if (el.selectionStart === 0 && el.selectionEnd === 0 && prev?.current) {
                prev.current.focus();
            }
        }
    };

    /** แผนที่ชื่อวันย่อภาษาไทย (ใช้กับ formatWeekDay) */
    const weekdayAbbrevTH: Record<string, string> = {
        "อาทิตย์": "อา.",
        "จันทร์": "จ.",
        "อังคาร": "อ.",
        "พุธ": "พ.",
        "พฤหัสบดี": "พฤ.",
        "ศุกร์": "ศ.",
        "เสาร์": "ส.",
    };

    /** คำนวณขนาดสำหรับ wrapper/อินพุตหลัก */
    const resolvedWidth = typeof width === "number" ? `${width}px` : width ?? "520px";
    const resolvedHeight = typeof height === "number" ? `${height}px` : height ?? "44px";

    return (
        <div ref={wrapperRef} className={`relative m-2 ${className ?? ""}`} style={{ width: resolvedWidth }}>
            {/* NOTE[a11y]: label + htmlFor ชี้ไปที่ div[role=group] จะไม่โฟกัสอินพุตโดยตรง
          แนะนำใช้ <fieldset><legend> หรือ aria-labelledby ครอบกล่องทั้งสามในอนาคต */}
            {label && (
                <label htmlFor={inputId} className="text-base font-semibold pl-0.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative mt-1">
                {/* กลุ่มกล่องแยก (วัน/เดือน/ปี พ.ศ.) */}
                <div
                    id={inputId}
                    role="group"
                    aria-label="Thai BE date input"
                    aria-describedby={!isValid ? errorId : undefined}
                    className={`flex items-center gap-2 rounded-md border bg-white px-3 pr-14
            ${isValid ? "border-gray-500 focus-within:border-emerald-400" : "border-red-500 focus-within:border-red-500"}`}
                    style={{ height: resolvedHeight }}
                >
                    {/* dd */}
                    <input
                        ref={dayInputRef}
                        inputMode="numeric"
                        pattern="\\d{2}" /* NOTE[html]: ใช้ช่วย validation ใน native submit; onChange ตัด non-digit อยู่แล้ว */
                        placeholder={segmented ? "วว" : ""}
                        value={dayText}
                        disabled={disabled}
                        required={required}
                        onChange={(e) => handleDayInput(e.target.value)}
                        onBlur={commitSegmentsToDate}
                        onKeyDown={(e) => e.key === "Enter" && commitSegmentsToDate()}
                        className="w-10 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                    <span className="text-gray-500 select-none">/</span>

                    {/* mm */}
                    <input
                        ref={monthInputRef}
                        inputMode="numeric"
                        pattern="\\d{2}"
                        placeholder={segmented ? "ดด" : ""}
                        value={monthText}
                        disabled={disabled}
                        onChange={(e) => handleMonthInput(e.target.value)}
                        onBlur={commitSegmentsToDate}
                        onKeyDown={(e) => {
                            handleBackspaceToPrev(e, dayInputRef);
                            if (e.key === "Enter") commitSegmentsToDate();
                        }}
                        className="w-10 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                    <span className="text-gray-500 select-none">/</span>

                    {/* yyyy (BE) */}
                    <input
                        ref={yearInputRef}
                        inputMode="numeric"
                        pattern="\\d{4}"
                        placeholder={segmented ? "ปปปป" : ""}
                        value={yearBeText}
                        disabled={disabled}
                        name={name}
                        onChange={(e) => handleYearInput(e.target.value)}
                        onBlur={commitSegmentsToDate}
                        onKeyDown={(e) => {
                            handleBackspaceToPrev(e, monthInputRef);
                            if (e.key === "Enter") commitSegmentsToDate();
                        }}
                        className="w-16 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                </div>

                {/* ปุ่มล้างค่า (โชว์เมื่อมีค่าอย่างน้อยหนึ่งกล่อง) */}
                {clearable && (dayText || monthText || yearBeText) && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            setDayText("");
                            setMonthText("");
                            setYearBeText("");
                            setIsValid(true);
                            setDateSafe(null);
                            onTextCommit?.("", null, true);
                            onClear?.();
                        }}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="ล้างค่า"
                    >
                        <Icon icon="material-symbols:close" className="w-[20px] h-[20px]" />
                    </button>
                )}

                {/* ปุ่มเปิด/ปิดปฏิทิน */}
                <button
                    type="button"
                    onClick={() => {
                        if (disabled) return;
                        setIsCalendarOpen((open) => {
                            onOpenChange?.(!open);
                            return !open;
                        });
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 ${calendarButtonClassName ?? ""}`}
                    aria-label="เปิดปฏิทิน"
                    aria-haspopup="dialog"
                    aria-expanded={isCalendarOpen}
                    disabled={disabled}
                >
                    <Icon icon="uil:calendar" className="w-[24px] h-[24px]" />
                </button>
            </div>

            {/* ข้อความ error (เชื่อมด้วย aria-describedby) */}
            {!isValid && (
                <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
                    {errorText}
                </p>
            )}

            {/* Calendar popover */}
            {isCalendarOpen && !disabled && (
                <div className={`absolute z-20 mt-2 w-auto ${dropdownClassName ?? ""}`}>
                    <DailyWrapper>
                        <DailyDatePickerContainer>
                            <DatePicker
                                inline
                                selected={selectedDate ?? undefined}
                                onChange={(dateOrRange: Date | [Date, Date] | null) => {
                                    const picked = Array.isArray(dateOrRange) ? dateOrRange[0] ?? null : dateOrRange;
                                    if (!picked) return;
                                    setDateSafe(picked);
                                    setDayText(pad2(picked.getDate()));
                                    setMonthText(pad2(picked.getMonth() + 1));
                                    setYearBeText(String(picked.getFullYear() + beOffset));
                                    setIsValid(true);
                                    if (autoCloseOnSelect) {
                                        setIsCalendarOpen(false);
                                        onOpenChange?.(false);
                                    }
                                }}
                                minDate={minDateResolved}
                                maxDate={maxDateResolved}
                                dateFormat="dd/MM/yyyy"
                                shouldCloseOnSelect={false}
                                showMonthDropdown={showMonthDropdown}
                                showYearDropdown={showYearDropdown}
                                dropdownMode={yearDropdownMode}
                                locale={locale}
                                /* ย่อชื่อวันเป็นภาษาไทย */
                                formatWeekDay={(name) => weekdayAbbrevTH[name] ?? name}
                            />
                        </DailyDatePickerContainer>
                    </DailyWrapper>
                </div>
            )}
        </div>
    );
};

// (ถ้าโปรเจกต์คุณใช้ default export เดิมอยู่ ให้คงบรรทัดนี้ไว้)
export default BoxDateInput;
