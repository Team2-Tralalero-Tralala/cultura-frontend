/*
 * File: CalendarPopover.tsx
 * Component: CalendarPopover (Client)
 * มาตรฐานตรวจ: CS v1.1.1
 * หน้าที่:
 *   - แสดงปฏิทินแบบ Weekly / Monthly / Yearly ผ่าน popover (ไม่รวม Daily)
 *   - เลือกเรนเดอร์คอมโพเนนต์ย่อยตามค่า prop 'type'
 */

import React, { useMemo } from "react";
import { WeeklyDate } from "../../WeeklyDate";
import { MonthlyDate } from "../../MonthlyDate";
import { YearlyDate } from "../../YearlyDate";

/** ---------- Types & Props ---------- */
/*
 * ชนิด: CalendarMode
 * คำอธิบาย: โหมดปฏิทินที่รองรับ
 */
export type CalendarMode = "weekly" | "monthly" | "yearly";

/*
 * ชนิด: CalendarPopoverProps
 * คำอธิบาย: พารามิเตอร์ควบคุมการเรนเดอร์และลักษณะตำแหน่งของ popover
 */
export type CalendarPopoverProps = {
  /** โหมดของปฏิทินที่จะแสดง (weekly/monthly/yearly) */
  type: CalendarMode;
  /** คลาสเพิ่มเติมของคอนเทนเนอร์ popover */
  className?: string;
  /** คลาสควบคุมตำแหน่ง (เช่น absolute/mt/left/z-index) */
  positionClassName?: string;
  /** ป้ายสำหรับผู้อ่านหน้าจอ ถ้าไม่ระบุจะสร้างตามโหมด */
  ariaLabel?: string;
};

/** ---------- Component ---------- */
export const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  type,
  className,
  positionClassName,
  ariaLabel,
}) => {
  /**
   * ตัวแปร: computedAriaLabel
   * คำอธิบาย: เลือกข้อความ ariaLabel อัตโนมัติตามโหมด หากไม่ได้ส่งมา
   */
  const computedAriaLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    switch (type) {
      case "weekly":
        return "ปฏิทินรายสัปดาห์";
      case "monthly":
        return "ปฏิทินรายเดือน";
      case "yearly":
        return "ปฏิทินรายปี";
      default:
        return "ปฏิทิน";
    }
  }, [ariaLabel, type]);

  /**
   * ตัวแปร: positionClass
   * คำอธิบาย: คลาสตำแหน่งที่ใช้จริง (มีค่าเริ่มต้นเพื่อให้ popover โผล่ใต้ trigger)
   */
  const positionClass = positionClassName ?? "absolute top-full left-0 mt-2 z-50";

  return (
    <div
      className={`${positionClass} ${className ?? ""}`}
      role="dialog"
      aria-modal={false}
      aria-label={computedAriaLabel}
    >
      {/* เรนเดอร์คอมโพเนนต์ปฏิทินตามโหมดที่กำหนด */}
      {type === "weekly" && <WeeklyDate />}
      {type === "monthly" && <MonthlyDate />}
      {type === "yearly" && <YearlyDate />}
    </div>
  );
};
