/* 
 * Component: CalendarPopover (Client)
 * คำอธิบาย: แสดงปฏิทินแบบ Daily / Weekly / Monthly เป็น popover ที่ยึดตำแหน่งสัมพันธ์กับ trigger
 *            ปรับ UI ตาม props และรองรับการปรับคลาสตำแหน่ง/คอนเทนเนอร์จากภายนอก
 * Input (Props): ดู CalendarPopoverProps ด้านล่าง
 * Output: JSX ของปฏิทินตามโหมดที่เลือก (แยกเรนเดอร์ตาม type)
 * หมายเหตุ: เขียนคอมเมนต์ไฟล์/ฟังก์ชันก่อนประกาศตามมาตรฐาน CS (ไทย/อังกฤษได้)
 */

import React, { useMemo } from "react";
import { DailyDate } from "../../DailyDate";
import { WeeklyDate } from "../../WeeklyDate";
import { MonthlyDate } from "../../MonthlyDate";

/** ---------- Types & Props ---------- */
/*
 * ฟังก์ชัน/ชนิด: CalendarMode
 * คำอธิบาย : โหมดของปฏิทินที่รองรับ
 * Output    : ลิสต์ literal type 'daily' | 'weekly' | 'monthly'
 */
type CalendarMode = "daily" | "weekly" | "monthly";

export type CalendarPopoverProps = {
  /** กำหนดประเภทของปฏิทินที่จะแสดง */
  type: CalendarMode;
  /** เพื่อการจัดวาง: คลาสของคอนเทนเนอร์ภายนอก (เช่น ตำแหน่ง/กว้าง/เงา) */
  className?: string;
  /** ปรับคลาสตำแหน่ง (ดีฟอลต์: absolute top-full left-0 mt-2 z-50) */
  positionClassName?: string;
  /** ป้ายบอกหน้าจอผู้อ่าน (screen reader); ถ้าไม่กำหนดจะสร้างให้อัตโนมัติจาก type */
  ariaLabel?: string;
};

/** ---------- Component ---------- */
/*
 * ฟังก์ชัน: CalendarPopover
 * คำอธิบาย : เรนเดอร์ปฏิทินตรงตามโหมด พร้อมระบุบทบาท A11y แบบ dialog ที่ไม่บล็อกพื้นหลัง
 * Input  : props { type, className?, positionClassName?, ariaLabel? }
 * Output : <div role="dialog"> ที่ห่อคอมโพเนนต์ปฏิทิน (Daily/Weekly/Monthly)
 */
export const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  type,
  className,
  positionClassName,
  ariaLabel,
}) => {
  // ป้ายสำหรับ screen reader ตามโหมด (เมื่อไม่ส่ง ariaLabel มา)
  const computedAriaLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    switch (type) {
      case "daily":
        return "ปฏิทินรายวัน";
      case "weekly":
        return "ปฏิทินรายสัปดาห์";
      case "monthly":
        return "ปฏิทินรายเดือน";
      default:
        return "ปฏิทิน";
    }
  }, [ariaLabel, type]);

  const pos = positionClassName ?? "absolute top-full left-0 mt-2 z-50";

  return (
    <div
      className={`${pos} ${className ?? ""}`}
      role="dialog"
      aria-modal={false}
      aria-label={computedAriaLabel}
    >
      {type === "daily" && <DailyDate />}
      {type === "weekly" && <WeeklyDate />}
      {type === "monthly" && <MonthlyDate />}
    </div>
  );
};
