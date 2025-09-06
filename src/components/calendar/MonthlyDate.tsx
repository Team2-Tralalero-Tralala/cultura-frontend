/*
 * คำอธิบาย: Component สำหรับเลือก "เดือน" เท่านั้น
 * แสดงรายชื่อเดือนเป็นกริด 12 ช่อง ผู้ใช้คลิกเพื่อเลือกเดือน (inline)
 */

import React, { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// ถ้าอยากให้เป็นภาษาไทย ให้เปิดคอมเมนต์ 2 บรรทัดล่าง แล้วส่ง locale ให้ DatePicker
// import { th } from "date-fns/locale";

import {
    MonthlyWrapper,
    MonthlyDatePickerContainer,
} from "./styled/MonthlyDate.Styled";

export const MonthlyDate = () => {
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    const handleChangeMonth = useCallback((date: Date | null) => {
        if (!date) return;
        // react-datepicker ส่งวันที่ในเดือนนั้นกลับมา
        // เก็บทั้ง Date ไว้เป็น anchor ของเดือนที่เลือก
        setSelectedMonth(date);
    }, []);

    return (
        <MonthlyWrapper>
            <MonthlyDatePickerContainer>
                <DatePicker
                    inline
                    // แสดงตัวเลือกเฉพาะ "เดือน+ปี"
                    showMonthYearPicker
                    // ถ้าอยากให้โชว์เฉพาะเดือน (ไม่ต้องโชว์ปี) ใช้ showMonthPicker ก็ได้ แต่จะไม่มี header ปี
                    // showMonthPicker
                    selected={selectedMonth}
                    onChange={handleChangeMonth}
                    dateFormat="MMMM yyyy"
                    // locale={th}
                    // ปิดการปิด popup เพื่อให้คลิกหลายครั้ง (แต่ inline อยู่แล้ว)
                    shouldCloseOnSelect={false}
                    // สไตล์เฉพาะของปุ่มเดือน
                    monthClassName={(d) =>
                        d.getMonth() === selectedMonth.getMonth() &&
                            d.getFullYear() === selectedMonth.getFullYear()
                            ? "rp-month-selected"
                            : "rp-month"
                    }
                />
            </MonthlyDatePickerContainer>
        </MonthlyWrapper>
    );
};
