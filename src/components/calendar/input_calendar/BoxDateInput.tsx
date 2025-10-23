/* 
 * Component: BEDateInput (Client)
 * Standard: CS v1.1.1 (TH)
 * หน้าที่:
 *   - อินพุตวันที่ระบบ พ.ศ. แบบกล่องแยก (วัน/เดือน/ปี) + ปุ่มเปิดปฏิทิน
 *   - ตรวจรูปแบบ dd/MM/yyyy (BE), ตรวจขอบเขต min/max (AD), รองรับ i18n(th), A11y
 *   - รองรับโหมด controlled/uncontrolled, มี onTextCommit/onOpenChange สำหรับ hook ภายนอก
 * หมายเหตุด้านมาตรฐาน:
 *   - A11y: ใช้ role="group" + aria-describedby สำหรับ error; แนะนำเพิ่ม fieldset/legend ในอนาคต (ดู NOTE[a11y])
 *   - i18n: ปรับปีใน dropdown ของ react-datepicker เป็น พ.ศ. ด้วย side-effect
 *   - UX: auto-advance กล่องถัดไปเมื่อกรอกครบ, backspace ถอยไปกล่องก่อนหน้า
 *   - Security: ไม่มีการ parse/format ข้ามเขตเวลา (ใช้ Date local) — เพียงพอสำหรับ UI ทั่วไป
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
 * คำอธิบาย: ฟังก์ชันบริสุทธิ์สำหรับจัดรูปแบบ/แปลงปี พ.ศ. ↔ ค.ศ.
 */

/** เติมเลขให้ครบ 2 หลัก (01, 02, ... 31) */
const pad2 = (n: number) => n.toString().padStart(2, "0");

/** แปลง Date(AD) → สตริง พ.ศ. รูปแบบ dd/MM/yyyy (ถ้า null คืน "") */
const toBE = (d: Date | null, beOffset = 543) =>
    d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear() + beOffset}` : "";

/** แปลงสตริง dd/MM/yyyy(BE) → Date(AD) (ตรวจวัน/เดือน/ปีจริงด้วยการเทียบค่าที่ new Date คืนมา) */
const parseBE = (s: string, beOffset = 543): Date | null => {
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const dd = +m[1], mm = +m[2] - 1, yBE = +m[3], yAD = yBE - beOffset;
    const d = new Date(yAD, mm, dd);
    return d.getFullYear() === yAD && d.getMonth() === mm && d.getDate() === dd ? d : null;
};

/** ---------- Props ----------
 * หมายเหตุ:
 *  - inputClassName: ไม่ถูกใช้เมื่อ segmented=true (เก็บไว้เพื่อ compatibility)
 *  - placeholder: ใช้เฉพาะแสดงบนกล่องย่อย (วว/ดด/ปปปป) เมื่อ segmented=true
 */
export type BEDateInputProps = {
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

    width?: number | string;   // default 520
    height?: number | string;  // default 44

    className?: string;
    inputClassName?: string;       // not used in segmented boxes; kept for compat
    dropdownClassName?: string;
    calendarButtonClassName?: string;

    locale?: Locale;               // default: Thai
    beOffset?: number;             // default: 543
    placeholder?: string;          // default: "วว/ดด/ปปปป"

    showMonthDropdown?: boolean;   // default: true
    showYearDropdown?: boolean;    // default: true
    yearDropdownMode?: "scroll" | "select"; // default: "select"

    autoCloseOnSelect?: boolean;   // default: true
    onTextCommit?: (text: string, parsed: Date | null, inRange: boolean) => void;
    onOpenChange?: (open: boolean) => void;

    clearable?: boolean;           // default: true
    onClear?: () => void;

    errorText?: string;            // default: "รูปแบบวันที่ไม่ถูกต้อง"

    /** ใช้ segmented boxes แทน input เดียว */
    segmented?: boolean;           // default: true
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
    const min = minDate ?? subYears(today, 15);
    const max = maxDate ?? addYears(today, 2);

    /** ---------- โหมด controlled/uncontrolled ---------- */
    const isControlled = value !== undefined;
    const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
    const selectedDate = isControlled ? (value as Date | null) : internalDate;

    /** ---------- สถานะ popover ---------- */
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    /** ---------- A11y IDs ---------- */
    const autoId = useId();
    const inputId = id ?? `be-date-${autoId}`;
    const errorId = `${inputId}-err`;

    /** ---------- สถานะกล่องแยก (dd/mm/yyyy BE) ---------- */
    const [dd, setDD] = useState<string>(selectedDate ? pad2(selectedDate.getDate()) : "");
    const [mm, setMM] = useState<string>(selectedDate ? pad2(selectedDate.getMonth() + 1) : "");
    const [yyyyBE, setYYYY] = useState<string>(selectedDate ? String(selectedDate.getFullYear() + beOffset) : "");
    const dRef = useRef<HTMLInputElement | null>(null);
    const mRef = useRef<HTMLInputElement | null>(null);
    const yRef = useRef<HTMLInputElement | null>(null);

    type InputRef =
        | React.RefObject<HTMLInputElement | null>
        | React.MutableRefObject<HTMLInputElement | null>;

    /** ---------- ความถูกต้องของอินพุต ---------- */
    const [isValid, setIsValid] = useState(true);

    /** ---------- ปิดปฏิทินเมื่อคลิกนอก ---------- */
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

    /** ---------- sync state จาก selectedDate ---------- */
    useEffect(() => {
        if (!selectedDate) {
            setDD(""); setMM(""); setYYYY(""); setIsValid(true);
            return;
        }
        setDD(pad2(selectedDate.getDate()));
        setMM(pad2(selectedDate.getMonth() + 1));
        setYYYY(String(selectedDate.getFullYear() + beOffset));
        setIsValid(true);
    }, [selectedDate, beOffset]);

    /** ---------- ปรับ year dropdown ของ react-datepicker ให้แสดงเป็น พ.ศ. ---------- */
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

    /** ตั้งค่า selectedDate โดยเซฟกับภายนอกถ้า onChange ถูกส่งเข้ามา (รองรับ controlled/uncontrolled) */
    const setDateSafe = (d: Date | null) => {
        if (!isControlled) setInternalDate(d);
        onChange?.(d);
    };

    /** รวมค่าสตริง BE จาก 3 กล่อง (ว่างถ้าขาดกล่องใดกล่องหนึ่ง) */
    const beString = () => (dd && mm && yyyyBE ? `${dd}/${mm}/${yyyyBE}` : "");

    /** คอมมิตค่าจากกล่องแยก → แปลงเป็น Date(AD) + ตรวจขอบเขต + แจ้งผล */
    const commitSegments = () => {
        const s = beString();
        if (!s) {
            setIsValid(true);
            onTextCommit?.("", null, true);
            setDateSafe(null);
            return;
        }
        const parsed = parseBE(s, beOffset);
        const inRange = !!parsed && parsed >= min && parsed <= max;
        setIsValid(inRange);
        onTextCommit?.(s, parsed, inRange);
        if (inRange) setDateSafe(parsed!);
    };

    /** ---------- Helpers สำหรับกล่องแยก ---------- */
    const onlyDigits = (v: string) => v.replace(/\D+/g, "");
    const handleDD = (v: string) => {
        const nxt = onlyDigits(v).slice(0, 2);
        setDD(nxt);
        if (nxt.length === 2) mRef.current?.focus();
    };
    const handleMM = (v: string) => {
        const nxt = onlyDigits(v).slice(0, 2);
        setMM(nxt);
        if (nxt.length === 2) yRef.current?.focus();
    };
    const handleYYYY = (v: string) => {
        const nxt = onlyDigits(v).slice(0, 4);
        setYYYY(nxt);
    };
    /** Backspace ที่ตำแหน่งเริ่มต้น → โฟกัสกล่องก่อนหน้า */
    const onKeyBack = (
        e: React.KeyboardEvent<HTMLInputElement>,
        prev?: InputRef
    ) => {
        if (e.key === "Backspace") {
            const el = e.currentTarget as HTMLInputElement;
            if (el.selectionStart === 0 && el.selectionEnd === 0 && prev?.current) {
                prev.current.focus();
            }
        }
    };

    /** แผนที่ชื่อวันย่อภาษาไทย */
    const weekdayShortTH: Record<string, string> = {
        "อาทิตย์": "อา.", "จันทร์": "จ.", "อังคาร": "อ.", "พุธ": "พ.", "พฤหัสบดี": "พฤ.", "ศุกร์": "ศ.", "เสาร์": "ส.",
    };

    /** คำนวณขนาดสำหรับ wrapper/อินพุตหลัก */
    const resolvedWidth = typeof width === "number" ? `${width}px` : width ?? "520px";
    const resolvedHeight = typeof height === "number" ? `${height}px` : height ?? "44px";

    return (
        <div ref={wrapRef} className={`relative m-2 ${className ?? ""}`} style={{ width: resolvedWidth }}>
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
                        ref={dRef}
                        inputMode="numeric"
                        pattern="\\d{2}"           /* NOTE[html]: ใช้ช่วย validation ใน native submit; onChange ตัด non-digit อยู่แล้ว */
                        placeholder={segmented ? "วว" : ""}
                        value={dd}
                        disabled={disabled}
                        required={required}
                        onChange={(e) => handleDD(e.target.value)}
                        onBlur={commitSegments}
                        onKeyDown={(e) => e.key === "Enter" && commitSegments()}
                        className="w-10 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                    <span className="text-gray-500 select-none">/</span>
                    {/* mm */}
                    <input
                        ref={mRef}
                        inputMode="numeric"
                        pattern="\\d{2}"
                        placeholder={segmented ? "ดด" : ""}
                        value={mm}
                        disabled={disabled}
                        onChange={(e) => handleMM(e.target.value)}
                        onBlur={commitSegments}
                        onKeyDown={(e) => { onKeyBack(e, dRef); if (e.key === "Enter") commitSegments(); }}
                        className="w-10 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                    <span className="text-gray-500 select-none">/</span>
                    {/* yyyy (BE) */}
                    <input
                        ref={yRef}
                        inputMode="numeric"
                        pattern="\\d{4}"
                        placeholder={segmented ? "ปปปป" : ""}
                        value={yyyyBE}
                        disabled={disabled}
                        name={name}
                        onChange={(e) => handleYYYY(e.target.value)}
                        onBlur={commitSegments}
                        onKeyDown={(e) => { onKeyBack(e, mRef); if (e.key === "Enter") commitSegments(); }}
                        className="w-16 text-center outline-none"
                        aria-invalid={!isValid}
                    />
                </div>

                {/* ปุ่มล้างค่า (โชว์เมื่อมีค่าอย่างน้อยหนึ่งกล่อง) */}
                {clearable && (dd || mm || yyyyBE) && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            setDD(""); setMM(""); setYYYY(""); setIsValid(true);
                            setDateSafe(null); onTextCommit?.("", null, true); onClear?.();
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
                        setIsOpen((v) => { onOpenChange?.(!v); return !v; });
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

            {/* ข้อความ error (เชื่อมด้วย aria-describedby) */}
            {!isValid && (
                <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
                    {errorText}
                </p>
            )}

            {/* Calendar popover */}
            {isOpen && !disabled && (
                <div className={`absolute z-20 mt-2 w-auto ${dropdownClassName ?? ""}`}>
                    <DailyWrapper>
                        <DailyDatePickerContainer>
                            <DatePicker
                                inline
                                selected={selectedDate ?? undefined}
                                onChange={(d: Date | [Date, Date] | null) => {
                                    const picked = Array.isArray(d) ? d[0] ?? null : d;
                                    if (!picked) return;
                                    setDateSafe(picked);
                                    setDD(pad2(picked.getDate()));
                                    setMM(pad2(picked.getMonth() + 1));
                                    setYYYY(String(picked.getFullYear() + beOffset));
                                    setIsValid(true);
                                    if (autoCloseOnSelect) { setIsOpen(false); onOpenChange?.(false); }
                                }}
                                minDate={min}
                                maxDate={max}
                                dateFormat="dd/MM/yyyy"
                                shouldCloseOnSelect={false}
                                showMonthDropdown={showMonthDropdown}
                                showYearDropdown={showYearDropdown}
                                dropdownMode={yearDropdownMode}
                                locale={locale}
                                /* ย่อชื่อวันเป็นภาษาไทย */
                                formatWeekDay={(name) => ({ "อาทิตย์": "อา.", "จันทร์": "จ.", "อังคาร": "อ.", "พุธ": "พ.", "พฤหัสบดี": "พฤ.", "ศุกร์": "ศ.", "เสาร์": "ส." }[name] ?? name)}
                            />
                        </DailyDatePickerContainer>
                    </DailyWrapper>
                </div>
            )}
        </div>
    );
};
