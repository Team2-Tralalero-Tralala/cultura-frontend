/* 
 * Component: BEDateInput (Client)
 * คำอธิบาย: อินพุตวันที่รูปแบบไทย (พ.ศ.) รองรับพิมพ์เอง/เลือกจากปฏิทิน, ตรวจรูปแบบ dd/MM/yyyy,
 *            ตรวจช่วงวันที่ (min/max), i18n (th), และ A11y (label/aria-invalid/aria-expanded)
 * Input (Props): ดู BEDateInputProps ด้านล่าง
 * Output: React JSX ของอินพุตวันที่; onChange(Date|null) (ค.ศ./AD)
 * หมายเหตุ: คอมเมนต์ตามมาตรฐานหัวข้อ "การเขียนคอมเมนต์" (เขียนก่อนประกาศฟังก์ชัน/ไฟล์) 
 *           และยึด Conventional Commits เวลา commit โค้ดนี้
 */

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DailyWrapper, DailyDatePickerContainer } from "../styled/DailyDate.Styled";
import { Icon } from "@iconify/react";
import { subYears, addYears } from "date-fns";
import type { Locale } from "date-fns";
import { th as thLocale } from "date-fns/locale";

/** ---------- Utils (Pure) ---------- */
/*
 * ฟังก์ชัน: pad2
 * คำอธิบาย : เติมศูนย์นำหน้าให้เป็น 2 หลัก
 * Input  : n:number
 * Output : string ตัวเลข 2 หลัก
 */
const pad2 = (n: number) => n.toString().padStart(2, "0");

/*
 * ฟังก์ชัน: toBE
 * คำอธิบาย : แปลง Date (ค.ศ.) เป็นสตริง พ.ศ. รูปแบบ dd/MM/yyyy
 * Input  : d:Date|null, beOffset:number (ดีฟอลต์ 543)
 * Output : string ("วว/ดด/ปปปป") หรือ "" ถ้า d เป็น null
 */
const toBE = (d: Date | null, beOffset = 543) =>
    d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear() + beOffset}` : "";

/*
 * ฟังก์ชัน: parseBE
 * คำอธิบาย : แปลงสตริง พ.ศ. "dd/MM/yyyy" เป็น Date (ค.ศ.) พร้อมตรวจความถูกต้องระดับวันจริง
 * Input  : s:string, beOffset:number (ดีฟอลต์ 543)
 * Output : Date | null (null เมื่อรูปแบบผิดหรือวัน/เดือน/ปีไม่ถูกต้อง)
 */
const parseBE = (s: string, beOffset = 543): Date | null => {
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const dd = +m[1];
    const mm = +m[2] - 1;
    const yBE = +m[3];
    const yAD = yBE - beOffset;
    const d = new Date(yAD, mm, dd);
    return d.getFullYear() === yAD && d.getMonth() === mm && d.getDate() === dd ? d : null;
};

/** ---------- Props ---------- */
export type BEDateInputProps = {
    /** Controlled value (AD). If provided => controlled. */
    value?: Date | null;
    /** Uncontrolled initial value (AD). */
    defaultValue?: Date | null;
    /** onChange returns AD Date (or null). */
    onChange?: (date: Date | null) => void;

    /** Min/Max (AD). Defaults: today-15y .. today+2y */
    minDate?: Date;
    maxDate?: Date;

    /** Label & required mark */
    label?: React.ReactNode;
    required?: boolean;

    /** Common input attrs */
    name?: string;
    id?: string;
    disabled?: boolean;

    /** Sizing */
    width?: number | string;   // default 520
    height?: number | string;  // default 44

    /** ClassNames */
    className?: string;            // wrapper
    inputClassName?: string;       // input
    dropdownClassName?: string;    // calendar container
    calendarButtonClassName?: string;

    /** i18n */
    locale?: Locale;               // default: Thai
    beOffset?: number;             // default: 543
    placeholder?: string;          // default: "วว/ดด/ปปปป"

    /** Dropdowns */
    showMonthDropdown?: boolean;   // default: true
    showYearDropdown?: boolean;    // default: true
    yearDropdownMode?: "scroll" | "select"; // default: "select"

    /** Auto close calendar after select */
    autoCloseOnSelect?: boolean;   // default: true

    /** Fired when user commits typing (Enter/blur) */
    onTextCommit?: (text: string, parsed: Date | null, inRange: boolean) => void;

    /** แจ้ง parent เมื่อเปิด/ปิดปฏิทิน */
    onOpenChange?: (open: boolean) => void;

    /** แสดงปุ่มล้างค่า */
    clearable?: boolean;           // default: true
    onClear?: () => void;

    /** ข้อความ error กรณี invalid/in-range false */
    errorText?: string;            // default: "วันที่ไม่ถูกต้องหรืออยู่นอกช่วงที่กำหนด"
};

/** ---------- Component ---------- */
export const BEDateInput: React.FC<BEDateInputProps> = ({
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
    inputClassName,
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
}) => {
    // ค่าดีฟอลต์ช่วงวันที่ (AD)
    const today = useMemo(() => new Date(), []);
    const min = minDate ?? subYears(today, 15);
    const max = maxDate ?? addYears(today, 2);

    // รองรับ controlled/uncontrolled
    const isControlled = value !== undefined;
    const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
    const selectedDate = isControlled ? (value as Date | null) : internalDate;

    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState<string>(selectedDate ? toBE(selectedDate, beOffset) : "");
    const [isValid, setIsValid] = useState(true);

    const wrapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // A11y: label ↔ input
    const autoId = useId();
    const inputId = id ?? `be-date-${autoId}`;
    const errorId = `${inputId}-err`;

    // ปิดปฏิทินเมื่อคลิกนอก
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [onOpenChange]);

    // sync ข้อความเมื่อ selectedDate หรือ beOffset เปลี่ยน
    useEffect(() => {
        setText(selectedDate ? toBE(selectedDate, beOffset) : "");
    }, [selectedDate, beOffset]);

    // แพตช์ให้ year dropdown แสดง พ.ศ. โดยจำกัด scope ใน component นี้
    useEffect(() => {
        if (!isOpen || !showYearDropdown) return;
        const root = wrapRef.current;
        const sel = root?.querySelector(".react-datepicker__year-select") as HTMLSelectElement | null;
        if (!sel) return;
        Array.from(sel.options).forEach((opt) => {
            const y = Number(opt.value);
            if (!Number.isNaN(y)) opt.textContent = String(y + beOffset);
        });
    }, [isOpen, selectedDate, showYearDropdown, beOffset]);

    /*
     * ฟังก์ชัน: setDateSafe
     * คำอธิบาย : เซ็ตค่า date ให้ถูกต้องตามโหมด (controlled/uncontrolled) แล้วเรียก onChange
     * Input  : d: Date|null
     * Output : void
     */
    const setDateSafe = (d: Date | null) => {
        if (!isControlled) setInternalDate(d);
        onChange?.(d);
    };

    /*
     * ฟังก์ชัน: commitText
     * คำอธิบาย : เมื่อผู้ใช้ blur/กด Enter จะ parse/validate ช่วง และอัปเดต state/emit event
     * Input  : none (ใช้ state text)
     * Output : void
     */
    const commitText = () => {
        if (text === "") {
            setIsValid(true);
            onTextCommit?.(text, null, true);
            setDateSafe(null);
            return;
        }
        const d = parseBE(text, beOffset);
        const inRange = !!d && d >= min && d <= max;
        setIsValid(inRange);
        onTextCommit?.(text, d, inRange);
        if (inRange) setDateSafe(d!);
    };

    // ย่อวันภาษาไทย (ขึ้นกับ locale ที่จ่ายให้ react-datepicker)
    const weekdayShortTH: Record<string, string> = {
        "อาทิตย์": "อา.",
        "จันทร์": "จ.",
        "อังคาร": "อ.",
        "พุธ": "พ.",
        "พฤหัสบดี": "พฤ.",
        "ศุกร์": "ศ.",
        "เสาร์": "ส.",
    };

    const resolvedWidth = typeof width === "number" ? `${width}px` : width ?? "520px";
    const resolvedHeight = typeof height === "number" ? `${height}px` : height ?? "44px";

    return (
        <div ref={wrapRef} className={`relative m-2 ${className ?? ""}`} style={{ width: resolvedWidth }}>
            {/* A11y: ใช้ <label htmlFor> ผูกกับ input */}
            {label && (
                <label htmlFor={inputId} className="text-base font-semibold pl-0.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative mt-1">
                <input
                    ref={inputRef}
                    id={inputId}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={commitText}
                    onKeyDown={(e) => e.key === "Enter" && (commitText(), inputRef.current?.blur())}
                    placeholder={placeholder}
                    name={name}
                    disabled={disabled}
                    required={required}
                    inputMode="numeric"
                    pattern="\\d{2}/\\d{2}/\\d{4}"
                    aria-invalid={!isValid}
                    aria-describedby={!isValid ? errorId : undefined}
                    style={{ height: resolvedHeight }}
                    className={`w-full rounded-md border bg-white px-4 pr-16 text-gray-700 outline-none transition ${isValid ? "border-gray-500 focus:border-emerald-400" : "border-red-500 focus:border-red-500"
                        } ${inputClassName ?? ""}`}
                />

                {/* ปุ่มล้างค่า */}
                {clearable && text && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            setText("");
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

                {/* ปุ่มเปิดปฏิทิน */}
                <button
                    type="button"
                    onClick={() => {
                        if (disabled) return;
                        setIsOpen((v) => {
                            onOpenChange?.(!v);
                            return !v;
                        });
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 ${calendarButtonClassName ?? ""}`}
                    aria-label="เปิดปฏิทิน"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <Icon icon="uil:calendar" className="w-[24px] h-[24px]" />
                </button>
            </div>

            {/* แสดงข้อความ error ตามมาตรฐาน A11y */}
            {!isValid && (
                <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
                    {errorText}
                </p>
            )}

            {isOpen && !disabled && (
                <div className={`absolute z-20 mt-2 w-auto ${dropdownClassName ?? ""}`}>
                    <DailyWrapper>
                        <DailyDatePickerContainer>
                            <DatePicker
                                inline
                                selected={selectedDate ?? undefined}
                                // react-datepicker อาจส่ง Date | null | [Date, Date]
                                onChange={(d: Date | [Date, Date] | null) => {
                                    const picked = Array.isArray(d) ? d[0] ?? null : d;
                                    if (!picked) return;
                                    setDateSafe(picked);
                                    setText(toBE(picked, beOffset));
                                    setIsValid(true);
                                    if (autoCloseOnSelect) {
                                        setIsOpen(false);
                                        onOpenChange?.(false);
                                    }
                                }}
                                minDate={min}
                                maxDate={max}
                                dateFormat="dd/MM/yyyy"
                                shouldCloseOnSelect={false}
                                showMonthDropdown={showMonthDropdown}
                                showYearDropdown={showYearDropdown}
                                dropdownMode={yearDropdownMode}
                                locale={locale}
                                formatWeekDay={(name) => weekdayShortTH[name] ?? name}
                            />
                        </DailyDatePickerContainer>
                    </DailyWrapper>
                </div>
            )}
        </div>
    );
};
