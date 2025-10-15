/* 
 * File: MonthlyDate.tsx
 * Component: MonthlyDate (Client)
 * คำอธิบาย: ปฏิทิน “เลือกเดือน” แบบ inline โดยใช้ react-datepicker (showMonthYearPicker)
 *            เฮดเดอร์คงปุ่มลูกศรเดิม + เพิ่มดรอปดาวน์ปี “พ.ศ.” (แสดง BE แต่ส่งค่า AD)
 * Input (Props): -
 * Output: JSX อินไลน์เดตพิกเกอร์ (state ภายใน)
 */

import React, { useCallback, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MonthlyWrapper, MonthlyDatePickerContainer } from "./styled/MonthlyDate.Styled";
import { th } from "date-fns/locale";
import { subYears, addYears } from "date-fns";

/*
 * ฟังก์ชัน: BE
 * คำอธิบาย : แปลงปีค.ศ. (AD) เป็นปีพ.ศ. (BE)
 * Input  : y:number (AD)
 * Output : number (BE)
 */
const BE = (y: number) => y + 543;

/*
 * ฟังก์ชัน: MonthlyDate
 * คำอธิบาย : แสดงอินไลน์ตัวเลือก “เดือน/ปี” พร้อมปีแบบพ.ศ.ในดรอปดาวน์ (คงปุ่มลูกศรเดิม)
 * Input  : -
 * Output : JSX ของ react-datepicker (inline)
 */
export const MonthlyDate: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  /*
   * ฟังก์ชัน: handleChangeMonth
   * คำอธิบาย : อัปเดตเดือนที่เลือก (ignore null)
   * Input  : date: Date|null
   * Output : void
   */
  const handleChangeMonth = useCallback((date: Date | null) => {
    if (date) setSelectedMonth(date);
  }, []);

  // ขอบเขตปีที่อนุญาต (ดีฟอลต์: วันนี้ -15 ปี ถึง วันนี้ +2 ปี)
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => subYears(today, 15), [today]);
  const maxDate = useMemo(() => addYears(today, 2), [today]);
  const minY = minDate.getFullYear();
  const maxY = maxDate.getFullYear();

  // รายการปี (AD) สำหรับดรอปดาวน์ — แสดงเป็น BE ใน UI
  const years = useMemo(
    () => Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i),
    [minY, maxY]
  );

  return (
    <MonthlyWrapper role="group" aria-label="เลือกเดือน (เดือนไทย + ปี พ.ศ.)">
      <MonthlyDatePickerContainer>
        <DatePicker
          inline
          showMonthYearPicker
          selected={selectedMonth}
          onChange={handleChangeMonth}
          shouldCloseOnSelect={false}
          locale={th}                  // เดือนไทย
          dateFormat="MMMM yyyy"       // ใช้ชื่อเดือนภาษาไทยจาก locale
          minDate={minDate}            // จำกัดช่วงเดือนตามขอบเขตปี
          maxDate={maxDate}
          monthClassName={(d) =>
            d.getMonth() === selectedMonth.getMonth() &&
            d.getFullYear() === selectedMonth.getFullYear()
              ? "rp-month-selected"
              : "rp-month"
          }
          /* เฮดเดอร์กำหนดเอง: คงปุ่มลูกศรเดิม + เพิ่มดรอปดาวน์ปี (พ.ศ.) */
          renderCustomHeader={({
            date,
            changeYear,
            decreaseYear,
            increaseYear,
            prevYearButtonDisabled,
            nextYearButtonDisabled,
          }) => (
            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "40px 1fr 40px",
                alignItems: "center",
              }}
              aria-label="ตัวเลือกปี"
            >
              {/* ปุ่มก่อนหน้า (คลาสเดิมของไลบรารี) */}
              <button
                type="button"
                onClick={() => !prevYearButtonDisabled && decreaseYear()}
                disabled={prevYearButtonDisabled}
                className="react-datepicker__navigation react-datepicker__navigation--previous"
                aria-label="ปีก่อนหน้า"
                style={{ position: "static" }}
              >
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous" />
              </button>

              {/* ดรอปดาวน์ปี (ค่า AD, แสดงผล BE) */}
              <select
                aria-label="เลือกปี (พ.ศ.)"
                value={date.getFullYear()}
                onChange={(e) => changeYear(Number(e.target.value))}
                style={{
                  appearance: "menulist",
                  WebkitAppearance: "menulist",
                  MozAppearance: "menulist",
                  justifySelf: "center",
                  fontSize: "0.9rem",
                  lineHeight: "1.75rem",
                  fontWeight: 500,
                  border: "none",
                  background: "transparent",
                  padding: 4,
                  cursor: "pointer",
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {BE(y)}
                  </option>
                ))}
              </select>

              {/* ปุ่มถัดไป (คลาสเดิมของไลบรารี) */}
              <button
                type="button"
                onClick={() => !nextYearButtonDisabled && increaseYear()}
                disabled={nextYearButtonDisabled}
                className="react-datepicker__navigation react-datepicker__navigation--next"
                aria-label="ปีถัดไป"
                style={{ position: "static" }}
              >
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next" />
              </button>
            </div>
          )}
        />
      </MonthlyDatePickerContainer>
    </MonthlyWrapper>
  );
};
