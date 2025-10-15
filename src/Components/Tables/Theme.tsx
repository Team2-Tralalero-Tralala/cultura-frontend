/*
* คำอธิบาย : ไฟล์กำหนดชุดธีมของ DataTable โดย map ThemeColor -> คลาส Tailwind
* ครอบคลุมสีหัวตาราง เส้นขอบ พื้นอ่อน กรอบนอก และ ring (โฟกัส)
* ใช้เพื่อคุมโทนภาพรวมของตารางให้สอดคล้องกับแบรนด์/ธีมเดียวกันทั้งระบบ
*
* หมายเหตุ:
* - มีการใช้ Tailwind arbitrary values (เช่น bg-[rgba(...)]/border-[rgba(...)]/ring-[rgba(...)])
*   หากใช้ JIT อยู่สามารถใช้งานได้เลย แต่ถ้า build แล้วคลาสหาย ให้เพิ่ม safelist ใน tailwind.config.js
*/

import type { ThemeColor } from "./Types";

export const themeHead: Record<ThemeColor, string> = {
    emerald: "bg-emerald-700 text-white",
    teal: "bg-teal-700 text-white",
    blue: "bg-sky-700 text-white",
    violet: "bg-violet-700 text-white",
    brand: "bg-[rgba(74,129,111,1)] text-white",
};


export const borderTone: Record<ThemeColor, string> = {
    emerald: "border-emerald-900/5",
    teal: "border-teal-900/5",
    blue: "border-sky-900/5",
    violet: "border-violet-900/5",
    brand: "border-[rgba(187,231,227,0.26)]",
};

export const softBg: Record<ThemeColor, string> = {
    emerald: "bg-emerald-50/40",
    teal: "bg-teal-50/40",
    blue: "bg-sky-50/40",
    violet: "bg-violet-50/40",
    brand: "bg-[rgba(187,231,227,0.12)]",
};

export const containerBorderCls: Record<ThemeColor, string> = {
    emerald: "border-emerald-300",
    teal: "border-teal-300",
    blue: "border-sky-300",
    violet: "border-violet-300",
    brand: "border-[rgba(187,231,227,0.26)]",
};

export const containerRingCls: Record<ThemeColor, string> = {
    emerald: "ring-emerald-200",
    teal: "ring-teal-200",
    blue: "ring-sky-200",
    violet: "ring-violet-200",
    brand: "ring-[rgba(187,231,227,0.26)]",
};
