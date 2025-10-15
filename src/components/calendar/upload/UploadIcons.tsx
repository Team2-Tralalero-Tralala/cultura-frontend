/*
 * File: components/UploadIcons.tsx
 * Component: IconifySvg (Client)
 * คำอธิบาย: ตัวช่วยเรนเดอร์ไอคอนด้วย @iconify/react
 *            - รองรับ className (Tailwind) และแสดงแบบ inline หากต้องการ
 *            - A11y: ถ้าระบุ ariaLabel ⇒ ตั้ง role="img" + aria-label;
 *                    ถ้าไม่ระบุ ⇒ aria-hidden เพื่อลดเสียงรบกวนของ screen reader
 * Input (Props): ดู IconifySvgProps
 * Output: <Icon> ของ Iconify
 */

import React from "react";
import { Icon } from "@iconify/react";

/** ---------- Props ---------- */
/*
 * ชนิด: IconifySvgProps
 * คำอธิบาย:
 *  - name: ชื่อไอคอนของ Iconify (เช่น 'icon-park:add-picture')
 *  - className: คลาสขนาด/สี (Tailwind ฯลฯ) ดีฟอลต์ w-6 h-6
 *  - inline: แสดงไอคอนแบบ inline (ดีฟอลต์ false)
 *  - ariaLabel: ป้ายชื่อเพื่อการเข้าถึง (ถ้าส่งมา ⇒ ไม่ aria-hidden)
 *  - title: ข้อความ title ใน <svg> เพิ่มเติม
 */
export type IconifySvgProps = {
    name: string;               // e.g. 'icon-park:add-picture'
    className?: string;         // Tailwind size classes, e.g. 'w-6 h-6'
    inline?: boolean;           // default false
    ariaLabel?: string;         // ชื่อสำหรับ screen reader; ถ้าไม่ส่งจะซ่อนไอคอนจาก SR
    title?: string;             // <title> ในไอคอน (optional)
};

/** ---------- Component ---------- */
/*
 * ฟังก์ชัน: IconifySvg
 * คำอธิบาย : เรนเดอร์ไอคอนจาก Iconify พร้อมตั้งค่า A11y ให้ถูกต้อง
 * Input  : IconifySvgProps
 * Output : <Icon> (svg) จาก @iconify/react
 */
export const IconifySvg: React.FC<IconifySvgProps> = ({
    name,
    className = "w-6 h-6",
    inline = false,
    ariaLabel,
}) => {
    // หากมี ariaLabel ⇒ ให้ screen reader อ่าน; หากไม่มีก็ซ่อนไอคอนจาก SR
    const a11yProps = ariaLabel
        ? { role: "img" as const, "aria-label": ariaLabel }
        : { "aria-hidden": true };

    return (
        <Icon
            icon={name}
            className={className}
            inline={inline}
            {...a11yProps}
        />
    );
};

// ---- Allowed presets (exactly two, per request) ----
// หมายเหตุ: เก็บเป็นคงที่แบบ named export ตามมาตรฐาน ไม่ใช้ default export
export const IMAGE_ICON = "icon-park:add-picture";
export const VIDEO_ICON = "charm:camera-video";
