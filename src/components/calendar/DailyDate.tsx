/* 
 * คำอธิบาย: Component สำหรับเลือกวันที่ (Daily Date Picker)
 * แสดงปฏิทินรายวันและบันทึกวันที่ที่ผู้ใช้เลือก
 */
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    DailyWrapper,
    DailyDatePickerContainer,
} from "./styled/DailyDate.Styled";

/* 
 * Function: DailyDate
 * Input : ไม่มี Props (internal state)
 * Output : JSX ของ DatePicker แบบ Daily
 */
export const DailyDate = () => {
    // State สำหรับเก็บวันที่ที่ผู้ใช้เลือก (ค่าเริ่มต้น: วันนี้)
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    return (
        <DailyWrapper>
            <DailyDatePickerContainer>
                <DatePicker
                    inline                      
                    selected={selectedDate}     
                    onChange={(d) => setSelectedDate(d)} 
                    dateFormat="dd/MM/yyyy"     
                    isClearable={false}         
                    shouldCloseOnSelect={false} 
                    formatWeekDay={(name) => name.slice(0, 3).toUpperCase()} 
                />
            </DailyDatePickerContainer>
        </DailyWrapper>
    );
};
