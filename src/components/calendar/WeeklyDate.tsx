/*
 * คำอธิบาย: Component สำหรับเลือกช่วง "รายสัปดาห์"
 * ผู้ใช้คลิกวันใดก็ได้ แล้วระบบจะล็อกทั้งสัปดาห์นั้นเป็นช่วง start-end
 */

import React, { useState, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    startOfWeek,
    endOfWeek,
    isSameDay,
    isWithinInterval,
} from "date-fns";
import {
    WeeklyWrapper,
    WeeklyDatePickerContainer,
} from "./styled/WeeklyDate.Styled";

export const WeeklyDate = () => {
    const weekStartsOn = 0 as const;

    const today = new Date();
    const [anchorDate, setAnchorDate] = useState<Date>(today);

    const { startDate, endDate } = useMemo(() => {
        const start = startOfWeek(anchorDate, { weekStartsOn });
        const end = endOfWeek(anchorDate, { weekStartsOn });
        return { startDate: start, endDate: end };
    }, [anchorDate, weekStartsOn]);

    // ใช้วันแรกที่คลิกเป็น anchor แล้วล็อกทั้งสัปดาห์
    const handleChangeRange = useCallback(
        (dates: [Date | null, Date | null] | Date | null) => {
            if (!dates) return;

            if (Array.isArray(dates)) {
                const [picked] = dates;
                if (picked) setAnchorDate(picked);
                return;
            }

            setAnchorDate(dates);
        },
        []
    );

    return (
        <WeeklyWrapper>
            <WeeklyDatePickerContainer>
                <DatePicker
                    inline
                    selectsRange
                    selected={anchorDate}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleChangeRange}
                    shouldCloseOnSelect={false}
                    dayClassName={(d: Date) => {
                        if (isSameDay(d, anchorDate)) return "rp-anchor";
                        if (isWithinInterval(d, { start: startDate, end: endDate }))
                            return "rp-inrange";
                        return "";
                    }}
                />
            </WeeklyDatePickerContainer>
        </WeeklyWrapper>
    );
};
