// Tag.tsx
/*
 * File: Tag.tsx
 * Component: Tag (Client)
 * คำอธิบาย: ป้าย (tag) สำหรับแสดงข้อความ/เนื้อหาแบบบล็อกกลางกรอบ
 *            ปรับขนาดได้ด้วย sizeClass (Tailwind) หรือ width/height (px/CSS length)
 *            โดย "sizeClass จะ override width/height" ตามสเปก
 * Input (Props): ดู TagProps
 * Output: <div> ที่จัดกึ่งกลางแนวแกน x/y พร้อมคลาส/ขนาดตามที่กำหนด
 */

import React from "react";

/** ---------- Types ---------- */
/*
 * ชนิด: TagProps
 * - label: เนื้อหาภายในแท็ก (ReactNode)
 * - className: คลาสเพิ่มเติมสำหรับตัวกรอบ
 * - sizeClass: คลาสขนาดแบบ Tailwind (เช่น "w-24 h-10") — ถ้ามีจะ override width/height
 * - width/height: number = px, string = CSS length หรือคลาส Tailwind (w-*, h-*)
 * - ariaLabel/title: ตัวเลือก A11y/tooltip
 */
export type TagProps = {
    label: React.ReactNode;
    className?: string;

    /** ใส่คลาส Tailwind ขนาดทีเดียว เช่น "w-24 h-10" (ถ้ามีจะ override ค่าด้านล่าง) */
    sizeClass?: string;

    /** กำหนดความกว้าง/สูง: number = px, string = CSS length หรือคลาส Tailwind (w-*, h-*) */
    width?: number | string;
    height?: number | string;

    /** A11y */
    ariaLabel?: string;
    title?: string;
};

/** ---------- Utils (Pure) ---------- */
/*
 * ฟังก์ชัน: isTwW / isTwH
 * คำอธิบาย : ตรวจว่าเป็นคลาส Tailwind ที่ขึ้นต้นด้วย w- / h-
 */
const isTwW = (v?: string) => typeof v === "string" && v.startsWith("w-");
const isTwH = (v?: string) => typeof v === "string" && v.startsWith("h-");

/*
 * ฟังก์ชัน: toLen
 * คำอธิบาย : number → 'Npx', string → string เดิม, undefined → undefined
 */
const toLen = (v?: number | string) => (typeof v === "number" ? `${v}px` : v);

/** ---------- Component ---------- */
/*
 * ฟังก์ชัน: Tag
 * คำอธิบาย : สร้างกรอบแท็กพร้อมจัดกลางข้อความ ปรับขนาด/สไตล์ได้
 * กติกา   : ถ้ามี sizeClass ⇒ ไม่ใช้ width/height (ทั้งคลาส w-/h- และ style)
 * Input  : TagProps
 * Output : <div> ป้ายพร้อมขนาดตามที่กำหนด
 */
export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
    ({ label, className, sizeClass, width, height, ariaLabel, title }, ref) => {
        // ถ้าใช้ sizeClass ⇒ ข้ามการคำนวณ width/height ทั้งหมด
        if (sizeClass) {
            return (
                <div
                    ref={ref}
                    className={`${sizeClass} border border-gray-200 rounded-lg flex items-center justify-center text-sm ${className ?? ""}`}
                    aria-label={ariaLabel}
                    title={title}
                >
                    {label}
                </div>
            );
        }

        // ไม่ได้ส่ง sizeClass ⇒ ตรวจว่า width/height เป็นคลาส w-/h- หรือเป็น length
        const wClass = isTwW(width as string) ? (width as string) : undefined;
        const hClass = isTwH(height as string) ? (height as string) : undefined;

        const sizeClasses = `${wClass ?? "w-20"} ${hClass ?? "h-9"}`;

        // ถ้า width/height เป็นตัวเลขหรือ CSS length → ใส่เป็น style
        const style: React.CSSProperties = {
            width: !wClass ? toLen(width) : undefined,
            height: !hClass ? toLen(height) : undefined,
        };

        return (
            <div
                ref={ref}
                className={`${sizeClasses} border border-gray-600 rounded-lg flex items-center justify-center font-medium ${className ?? ""}`}
                style={style}
                aria-label={ariaLabel}
                title={title}
            >
                {label}
            </div>
        );
    }
);

Tag.displayName = "Tag";
