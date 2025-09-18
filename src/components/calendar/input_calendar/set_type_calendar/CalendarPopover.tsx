/* 
 * คำอธิบาย : Component สำหรับแสดงปฏิทินในรูปแบบ Daily, Weekly หรือ Monthly 
 * โดยจะเปลี่ยน UI ตามค่า props ที่ส่งเข้ามา
 */

import React from "react";
import { DailyDate } from "../../DailyDate";
import { WeeklyDate } from "../../WeeklyDate";
import { MonthlyDate } from "../../MonthlyDate";

type CalendarPopoverProps = {
    type: "daily" | "weekly" | "monthly"; // Input: กำหนดประเภทของปฏิทินที่จะแสดง
};

/* 
 * Function: CalendarPopover
 * Input : props { type: "daily" | "weekly" | "monthly" }
 * Output : JSX ของปฏิทินตามประเภทที่เลือก
 */
export const CalendarPopover: React.FC<CalendarPopoverProps> = ({ type }) => {
    return (
        <div className="absolute top-full left-0 mt-2 z-50">
            {type === "daily" && <DailyDate />}
            {type === "weekly" && <WeeklyDate />}
            {type === "monthly" && <MonthlyDate />}
        </div>
    );
};
