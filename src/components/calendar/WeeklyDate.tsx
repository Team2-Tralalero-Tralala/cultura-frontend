/* 
 * คำอธิบาย: Component สำหรับ Weekly DatePicker
 * ใช้ react-datepicker แบบเลือกช่วงวัน (Range Picker)
 * และใช้สไตล์จาก WeeklyDatePickerContainer
 */
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    WeeklyWrapper,
    WeeklyDatePickerContainer,
} from "./styled/WeeklyDate.Styled";

/* 
 * Function: WeeklyDate
 * Input : ไม่มี Props (ใช้ internal state)
 * Output : JSX ของ DatePicker สำหรับเลือกช่วงวัน (StartDate–EndDate)
 */
export const WeeklyDate = () => {
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = range;
    return (
        <WeeklyWrapper>
            <WeeklyDatePickerContainer>
                <DatePicker
                    inline
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    selected={startDate}
                    onChange={(update) => {
                        if (Array.isArray(update)) {
                            setRange(update as [Date | null, Date | null]);
                        }
                    }}
                    shouldCloseOnSelect={false}
                    formatWeekDay={(name) => name.slice(0, 3).toUpperCase()}
                    showPopperArrow={false}

                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                />

            </WeeklyDatePickerContainer>
        </WeeklyWrapper>
    );
};
