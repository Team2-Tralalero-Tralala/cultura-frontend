/*
 * File: BoxDateInput.tsx
 * Component: BoxDateInput (Client)
 * Standard: CS v1.1.1 (TH)
 *
 * Responsibility:
 *  - กล่องอินพุตวันที่ (BE) แบบแบ่ง 3 ช่อง (วัน/เดือน/ปี) + ปุ่มเปิดปฏิทิน
 *  - รับ/ส่งค่า Date (AD) ภายนอก แต่แสดง/พิมพ์เป็น BE (dd/MM/yyyy)
 *  - ตรวจรูปแบบ, ตรวจช่วง min/max (ใน AD), รองรับ controlled/uncontrolled
 *  - Hook ภายนอก: onTextCommit, onOpenChange
 *
 * A11y:
 *  - ใช้ role="group" + aria-describedby เชื่อม error
 *  - แนะนำในอนาคต: ครอบด้วย <fieldset><legend> เพื่อ semantic ที่ดีกว่า (ดู NOTE[a11y])
 */

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DailyWrapper, DailyDatePickerContainer } from "../styled/DailyDate.Styled";
import { Icon } from "@iconify/react";
import { subYears, addYears } from "date-fns";
import type { Locale } from "date-fns";
import { th as thLocale } from "date-fns/locale";

/* ============================== Utils (Pure) ============================== */
/**
 * เติมเลขให้ครบ 2 หลัก (01..09)
 */
const pad2 = (n: number) => n.toString().padStart(2, "0");

/**
 * แปลง Date(AD) → สตริง BE (dd/MM/yyyy)
 * หมายเหตุ: ปัจจุบัน “ยังไม่ถูกใช้งาน” เก็บไว้เพื่อ compatibility / การ log ภายนอก
 */
const formatDateToBEString = (dateAD: Date | null, buddhistYearOffset = 543) =>
    dateAD
        ? `${pad2(dateAD.getDate())}/${pad2(dateAD.getMonth() + 1)}/${dateAD.getFullYear() + buddhistYearOffset}`
        : "";

/**
 * แปลงสตริง BE "dd/MM/yyyy" → Date(AD) พร้อมตรวจวันจริง (ไม่ยอมรับวันที่ invalid เช่น 31/02/2568)
 * @param dateText สตริงรูปแบบ dd/MM/yyyy (BE)
 * @param beOffset offset ปีพุทธศักราช (ดีฟอลต์ 543)
 * @returns Date (AD) หรือ null เมื่อรูปแบบ/วันไม่ถูกต้อง
 */
const parseBE = (dateText: string, beOffset = 543): Date | null => {
    const matchParts = dateText.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!matchParts) return null;

    const day = Number(matchParts[1]);
    const monthIndex = Number(matchParts[2]) - 1; // 0-based
    const buddhistYear = Number(matchParts[3]);
    const gregorianYear = buddhistYear - beOffset;

    const dateCandidate = new Date(gregorianYear, monthIndex, day);
    const isSame =
        dateCandidate.getFullYear() === gregorianYear &&
        dateCandidate.getMonth() === monthIndex &&
        dateCandidate.getDate() === day;

    return isSame ? dateCandidate : null;
};

/* ================================= Props ================================= */
export type BoxDateInputProps = {
    /* Value & change */
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (date: Date | null) => void;

    /* Range constraints (AD) */
    minDate?: Date;
    maxDate?: Date;

    /* Label & form */
    label?: React.ReactNode;
    required?: boolean;
    name?: string;
    id?: string;
    disabled?: boolean;

    /* Layout */
    width?: number | string;  // default 797
    height?: number | string; // default 44
    className?: string;       // wrapper ภายนอก

    /* Styling */
    inputClassName?: string;        // (compat) ไม่ใช้ในโหมด segmented
    dropdownClassName?: string;
    calendarButtonClassName?: string;
    boxClassName?: string;          // class ของกรุ๊ป dd/mm/yyyy
    borderRadius?: string;          // ปรับรัศมีขอบของกรุ๊ป
    fontClassName?: string;         // class font ทั้งกล่อง (ดีฟอลต์ "font-sarabun")

    /* i18n & format */
    locale?: Locale;   // default: Thai
    beOffset?: number; // default: 543
    placeholder?: string; // default: "วว/ดด/ปปปป"

    /* DatePicker options */
    showMonthDropdown?: boolean;         // default: true
    showYearDropdown?: boolean;          // default: true
    yearDropdownMode?: "scroll" | "select"; // default: "select"

    /* Behavior */
    autoCloseOnSelect?: boolean; // default: true
    clearable?: boolean;         // default: true
    segmented?: boolean;         // default: true (โหมดกล่องแบ่ง 3 ช่อง)

    /* Hooks */
    onTextCommit?: (text: string, parsed: Date | null, inRange: boolean) => void;
    onOpenChange?: (open: boolean) => void;
    onClear?: () => void;

    /* Error text */
    errorText?: string; // default: "รูปแบบวันที่ไม่ถูกต้อง"
};

/* ============================== Component ============================== */
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
    width = 797,
    height = 44,
    className,
    inputClassName, // NOTE[compat]: ตำแหน่งไว้คง signature (ไม่ได้ใช้ใน segmented)
    dropdownClassName,
    calendarButtonClassName,
    boxClassName,
    borderRadius,
    locale = thLocale,
    beOffset = 543,
    placeholder = "วว/ดด/ปปปป",
    showMonthDropdown = true,
    fontClassName = "font-sarabun",
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
    /* ---------- Default range (AD) ---------- */
    const today = useMemo(() => new Date(), []);
    const minDateResolved = minDate ?? subYears(today, 15);
    const maxDateResolved = maxDate ?? addYears(today, 2);

    /* ---------- Controlled vs Uncontrolled ---------- */
    const isControlled = value !== undefined;
    const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
    const selectedDate = isControlled ? (value as Date | null) : internalDate;

    /* ---------- Calendar popover visibility ---------- */
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* ---------- A11y IDs (for group + error) ---------- */
    const autoId = useId();
    const inputId = id ?? `be-date-${autoId}`;
    const errorId = `${inputId}-err`;

    /* ---------- Segmented Inputs state (BE texts) ---------- */
    const [dayText, setDayText] = useState<string>(selectedDate ? pad2(selectedDate.getDate()) : "");
    const [monthText, setMonthText] = useState<string>(selectedDate ? pad2(selectedDate.getMonth() + 1) : "");
    const [yearBeText, setYearBeText] = useState<string>(selectedDate ? String(selectedDate.getFullYear() + beOffset) : "");

    const dayInputRef = useRef<HTMLInputElement | null>(null);
    const monthInputRef = useRef<HTMLInputElement | null>(null);
    const yearInputRef = useRef<HTMLInputElement | null>(null);
    type InputRef =
        | React.RefObject<HTMLInputElement | null>
        | React.MutableRefObject<HTMLInputElement | null>;

    /* ---------- Validity (range + format) ---------- */
    const [isValid, setIsValid] = useState(true);

    /* ---------- Close calendar when clicking outside ---------- */
    useEffect(() => {
        const onDocDown = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsCalendarOpen(false);
                onOpenChange?.(false);
            }
        };
        document.addEventListener("mousedown", onDocDown);
        return () => document.removeEventListener("mousedown", onDocDown);
    }, [onOpenChange]);

    /* ---------- Sync view texts when selectedDate changed ---------- */
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

    /* ---------- Patch year dropdown to BE year texts ---------- */
    useEffect(() => {
        if (!isCalendarOpen || !showYearDropdown) return;
        const selectEl = wrapperRef.current?.querySelector(".react-datepicker__year-select") as HTMLSelectElement | null;
        if (!selectEl) return;
        Array.from(selectEl.options).forEach((opt) => {
            const adYear = Number(opt.value);
            if (!Number.isNaN(adYear)) opt.textContent = String(adYear + beOffset);
        });
    }, [isCalendarOpen, selectedDate, showYearDropdown, beOffset]);

    /* ================================ Helpers ================================ */
    /**
     * เซ็ตค่าระดับ component และยิง onChange (รองรับ controlled/uncontrolled)
     */
    const setDateSafe = (dateValue: Date | null) => {
        if (!isControlled) setInternalDate(dateValue);
        onChange?.(dateValue);
    };

    /**
     * รวมค่า BE จาก 3 ช่อง (ถ้าช่องใดว่าง → ส่งสตริงว่าง)
     */
    const beDateText = () =>
        dayText && monthText && yearBeText ? `${dayText}/${monthText}/${yearBeText}` : "";

    /**
     * คอมมิตค่าจาก segmented → แปลงเป็น Date(AD) + ตรวจช่วง + แจ้งผลออกนอก
     */
    const commitSegmentsToDate = () => {
        const text = beDateText();
        if (!text) {
            setIsValid(true);
            onTextCommit?.("", null, true);
            setDateSafe(null);
            return;
        }
        const parsed = parseBE(text, beOffset);
        const inRange = !!parsed && parsed >= minDateResolved && parsed <= maxDateResolved;
        setIsValid(inRange);
        onTextCommit?.(text, parsed, inRange);
        if (inRange) setDateSafe(parsed!);
    };

    /** ตัดเฉพาะตัวเลข */
    const extractDigits = (v: string) => v.replace(/\D+/g, "");

    /** onChange: ช่องวัน → auto focus ไปเดือนเมื่อครบ 2 หลัก */
    const handleDayInput = (v: string) => {
        const n = extractDigits(v).slice(0, 2);
        setDayText(n);
        if (n.length === 2) monthInputRef.current?.focus();
    };

    /** onChange: ช่องเดือน → auto focus ไปปีเมื่อครบ 2 หลัก */
    const handleMonthInput = (v: string) => {
        const n = extractDigits(v).slice(0, 2);
        setMonthText(n);
        if (n.length === 2) yearInputRef.current?.focus();
    };

    /** onChange: ช่องปี (รับ 4 หลัก BE) */
    const handleYearInput = (v: string) => {
        const n = extractDigits(v).slice(0, 4);
        setYearBeText(n);
    };

    /**
     * Backspace ที่ตำแหน่ง index 0 → โฟกัสไปช่องก่อนหน้า (ช่วย UX ตอนลบ)
     */
    const handleBackspaceToPrev = (e: React.KeyboardEvent<HTMLInputElement>, prev?: InputRef) => {
        if (e.key === "Backspace") {
            const el = e.currentTarget as HTMLInputElement;
            if (el.selectionStart === 0 && el.selectionEnd === 0 && prev?.current) prev.current.focus();
        }
    };

    /** ย่อชื่อวันภาษาไทย สำหรับหัวตารางปฏิทิน */
    const weekdayAbbrevTH: Record<string, string> = {
        "อาทิตย์": "อา.",
        "จันทร์": "จ.",
        "อังคาร": "อ.",
        "พุธ": "พ.",
        "พฤหัสบดี": "พฤ.",
        "ศุกร์": "ศ.",
        "เสาร์": "ส.",
    };

    /* ================================ Layout ================================ */
    const resolvedWidth = typeof width === "number" ? `${width}px` : width ?? "797px";
    const resolvedHeight = typeof height === "number" ? `${height}px` : height ?? "44px";

    /* ================================= Render ================================= */
    return (
        <div ref={wrapperRef} className={`relative m-2 ${className ?? ""}`} style={{ width: resolvedWidth }}>
            {/* NOTE[a11y]: label htmlFor → group div (ไม่ได้โฟกัสอินพุตจริง) แนะนำ <fieldset><legend> ในอนาคต */}
            {label && (
                <label htmlFor={inputId} className="text-base font-semibold pl-0.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative mt-1">
                {/* กล่องแบ่งวัน/เดือน/ปี (BE) */}
                <div
                    id={inputId}
                    role="group"
                    aria-label="Thai BE date input"
                    aria-describedby={!isValid ? errorId : undefined}
                    className={[
                        "block w-full",
                        "rounded-form",
                        "border-1",
                        isValid
                            ? "border-gray-400 focus-within:ring-gray-400 focus-within:border-gray-500"
                            : "border-red-500 focus-within:ring-red-500 focus-within:border-red-500",
                        "bg-white px-5 py-2",
                        "text-base text-gray-900 placeholder:text-gray-500 leading-relaxed",
                        "focus:outline-none focus-within:ring-1 transition-shadow",
                        "flex items-center gap-2 pr-14",
                        fontClassName,
                    ].join(" ") + (boxClassName ? ` ${boxClassName}` : "")}
                    style={{ height: resolvedHeight, borderRadius }}
                >
                    {/* dd */}
                    <input
                        ref={dayInputRef}
                        inputMode="numeric"
                        pattern="\\d{2}"
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

                {/* ปุ่มล้างค่า (แสดงเมื่อมีค่าบางช่อง) */}
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

            {/* Error text (เชื่อมด้วย aria-describedby) */}
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
                                onChange={(val: Date | [Date, Date] | null) => {
                                    const picked = Array.isArray(val) ? val[0] ?? null : val;
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

export default BoxDateInput;
