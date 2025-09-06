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

export const DailyDate = () => {
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
