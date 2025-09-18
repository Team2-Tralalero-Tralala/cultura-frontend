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

/* 
 * Function: MonthlyDate
 * Input : ไม่มี Props (internal state)
 * Output : JSX ของ DatePicker แบบเลือกเดือน
 */
export const MonthlyDate = () => {
    // State สำหรับเก็บเดือนที่เลือก (ค่าเริ่มต้น: เดือนปัจจุบัน)
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    /* 
     * Function: handleChangeMonth
     * Input : date (Date | null) เดือนที่เลือกจาก DatePicker
     * Output : ไม่มี (อัพเดท state selectedMonth)
     */
    const handleChangeMonth = useCallback((date: Date | null) => {
        if (!date) return;
        setSelectedMonth(date);
    }, []);

    return (
        <MonthlyWrapper>
            <MonthlyDatePickerContainer>
                <DatePicker
                    inline
                    showMonthYearPicker
                    selected={selectedMonth}       
                    onChange={handleChangeMonth}    
                    dateFormat="MMMM yyyy"            
                    shouldCloseOnSelect={false}    
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
