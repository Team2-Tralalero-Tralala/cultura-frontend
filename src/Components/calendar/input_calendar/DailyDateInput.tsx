/*
 * Component: DailyDateInput (Client)
 * คำอธิบาย: ปุ่ม/อินพุตสำหรับเลือกวันที่ พร้อม Popover แสดงปฏิทินรายวัน
 *            ใช้ร่วมกับ <DailyDate /> (รองรับ onSelect(dStr) หากมี)
 * Input (Props): ดู DailyDateInputProps
 * Output: JSX ปุ่มอินพุต + Popover ปฏิทิน; onChange?(string|null) (รูปแบบข้อความของวันที่)
 * หมายเหตุ: เขียนคอมเมนต์ไฟล์/ฟังก์ชันตามมาตรฐาน CS (ไทย/อังกฤษได้) และตั้งชื่อไฟล์/ฟังก์ชันแบบ PascalCase
 */

import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { DailyDate } from "../DailyDate";
import { Icon } from "@iconify/react";

/** ---------- Props ----------*/
export type DailyDateInputProps = {
    /** กำหนดความกว้างของคอมโพเนนต์ (เช่น 255 หรือ "100%") */
    width?: number | string; // default 255
    /** กำหนดความสูงของปุ่มอินพุต */
    height?: number | string; // default 41
    /** ข้อความ placeholder เมื่อยังไม่เลือกวัน */
    placeholder?: string; // default "เลือกวันที่"
    /** ค่าปัจจุบัน (controlled); ถ้าไม่ส่งจะเป็นโหมด uncontrolled */
    value?: string | null;
    /** ค่าเริ่มต้น (uncontrolled) */
    defaultValue?: string | null;
    /** ส่งค่ากลับเมื่อมีการเลือก/ล้างค่า (ข้อความวันที่หรือ null) */
    onChange?: (v: string | null) => void;
    /** ปิด/เปิดปฏิทินแล้วแจ้งให้ parent ทราบ (optional) */
    onOpenChange?: (open: boolean) => void;
    /** ปุ่มล้างค่า */
    clearable?: boolean; // default true
    /** ปิดการใช้งาน */
    disabled?: boolean; // default false
    /** ระบุ label (และผูกกับ input) เพื่อ A11y */
    label?: React.ReactNode;
    /** กำหนด id/name/required ให้ input (semantic forms) */
    id?: string;
    name?: string;
    required?: boolean;
    /** ข้อความ error (แสดงเมื่อ invalid ในบาง use-case ภายนอก) */
    errorText?: string;
    /** onSelect (สะท้อนกลับไปยัง parent เพิ่มเติมจาก onChange) */
    onSelect?: (dStr: string) => void;
    /** ใส่ class เพิ่มเติมได้ */
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    popoverClassName?: string;
};

/** ---------- Bridge type เพื่อส่ง onSelect ไป DailyDate โดยไม่แก้ไฟล์ DailyDate.tsx ---------- */
type DDBaseProps = React.ComponentProps<typeof DailyDate>;
const DailyDateWithSelect = DailyDate as unknown as React.ComponentType<DDBaseProps>;

/*
 * ฟังก์ชัน: parseYmdToLocalDate
 * คำอธิบาย: แปลง "YYYY-MM-DD" → Date (local time) เพื่อใช้แสดง selected ใน DatePicker
 */
const parseYmdToLocalDate = (ymd: string): Date | null => {
    const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return null;
    return new Date(year, monthIndex, day);
};

export const DailyDateInput: React.FC<DailyDateInputProps> = ({
    width = 255,
    height = 41,
    placeholder = "เลือกวันที่",
    value,
    defaultValue = null,
    onChange,
    onOpenChange,
    onSelect,
    clearable = true,
    disabled = false,
    label,
    id,
    name,
    required = false,
    errorText,
    className,
    inputClassName,
    buttonClassName,
    popoverClassName,
}) => {
    // ---------- State: controlled/uncontrolled ----------
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<string | null>(defaultValue);
    const selected = isControlled ? (value ?? null) : innerValue;

    // ---------- UI state ----------
    const [isOpen, setIsOpen] = useState(false);

    // ---------- Refs & IDs ----------
    const wrapperRef = useRef<HTMLDivElement>(null);
    const autoId = useId();
    const inputId = id ?? `daily-date-input-${autoId}`;
    const errorId = `${inputId}-err`;

    // ---------- Memo: resolve size ----------
    const resolvedWidth = useMemo(() => (typeof width === "number" ? `${width}px` : width), [width]);
    const resolvedHeight = useMemo(() => (typeof height === "number" ? `${height}px` : height), [height]);

    // แปลง selected string → Date เพื่อให้ปฏิทิน highlight วันเดิมได้
    const selectedDateObj = useMemo(() => {
        if (!selected) return null;
        // รองรับทั้ง "YYYY-MM-DD" และ ISO date-time
        const ymd = selected.includes("T") ? selected.split("T")[0] : selected;
        return parseYmdToLocalDate(ymd) ?? new Date(selected);
    }, [selected]);

    /*
     * ฟังก์ชัน: setValueSafe
     * คำอธิบาย : เซ็ตค่า selected (รองรับทั้ง controlled/uncontrolled) แล้วส่ง onChange
     * Input  : v: string|null
     * Output : void
     */
    const setValueSafe = (v: string | null) => {
        if (!isControlled) setInnerValue(v);
        onChange?.(v);
    };

    /*
     * ฟังก์ชัน: handleClickOutside
     * คำอธิบาย : ปิด Popover เมื่อคลิกนอกคอมโพเนนต์
     */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onOpenChange]);

    /*
     * ฟังก์ชัน: toggleOpen
     * คำอธิบาย : เปิด/ปิด Popover และแจ้ง parent (ถ้าระบุ)
     */
    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen((v) => {
            const next = !v;
            onOpenChange?.(next);
            return next;
        });
    };

    return (
        <div ref={wrapperRef} className={`relative m-2 ${className ?? ""}`} style={{ width: resolvedWidth }}>
            {/* A11y: label ↔ input */}
            {label && (
                <label htmlFor={inputId} className="text-base font-semibold pl-0.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative mt-1">
                {/* ช่องแสดงค่าปัจจุบันแบบ readOnly สำหรับฟอร์ม/การโฟกัสที่ชัดเจน */}
                <input
                    id={inputId}
                    name={name}
                    value={selected ?? ""}
                    readOnly
                    disabled={disabled}
                    required={required}
                    aria-invalid={!!errorText}
                    aria-describedby={errorText ? errorId : undefined}
                    placeholder={placeholder}
                    style={{ height: resolvedHeight }}
                    className={`w-full rounded-2xl border bg-white px-12 text-center text-gray-700 outline-none transition
                                ${errorText ? "border-red-500 focus:border-red-500" : "border-gray-500 focus:border-emerald-400"}
                                ${inputClassName ?? ""}`}
                    onClick={toggleOpen}
                />

                {/* ปุ่มล้างค่า */}
                {clearable && selected && !disabled && (
                    <button
                        type="button"
                        onClick={() => setValueSafe(null)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="ล้างค่า"
                    >
                        <Icon icon="material-symbols:close" className="w-[20px] h-[20px]" />
                    </button>
                )}

                {/* ปุ่มเปิดปฏิทิน */}
                <button
                    type="button"
                    onClick={toggleOpen}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 ${buttonClassName ?? ""}`}
                    aria-label="เปิดปฏิทิน"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <Icon icon="quill:calendar" className="w-[26px] h-[26px]" />
                </button>
            </div>

            {/* แสดง error A11y */}
            {errorText && (
                <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
                    {errorText}
                </p>
            )}

            {/* Popover ปฏิทิน */}
            {isOpen && !disabled && (
                <div className={`absolute top-full left-0 mt-2 z-20 ${popoverClassName ?? ""}`} role="dialog" aria-modal="false">
                    {/* หาก DailyDate รองรับ onSelect(dStr) โค้ดด้านล่างจะทำงานได้ทันที */}
                    <DailyDateWithSelect
                        value={selectedDateObj}
                        onSelect={(dStr: string) => {
                            setValueSafe(dStr);
                            onSelect?.(dStr);
                            setIsOpen(false);
                            onOpenChange?.(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
