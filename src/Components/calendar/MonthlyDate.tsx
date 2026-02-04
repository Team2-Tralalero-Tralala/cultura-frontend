/*
 * File: MonthlyDate.tsx
 * Component: MonthlyDate (Client)
 * บทบาท:
 * - ปฏิทินเลือก "หลายเดือนแบบอิสระ" (Multiple Selection)
 * - คลิกเลือกเดือนไหนก็ได้ (Toggle: คลิกซ้ำเพื่อยกเลิก)
 * - ธีมสี: ใช้สไตล์เดิมจาก MonthlyDatePickerContainer (เดือนที่เลือก = สีเขียวเข้ม)
 * ขอบเขต:
 * - ไม่ใช้ selectsRange แล้ว เปลี่ยนเป็น Custom Logic จัดการ Array
 * - Header: คงปุ่มเลื่อนปี และ dropdown ปี พ.ศ. (+543) ไว้เหมือนเดิม
 * Input (Props):
 * - onDateChange?: (dates: Date[]) => void  // ส่งออกเป็น Array ของวันที่เลือก
 * Output:
 * - JSX: เดตพิกเกอร์โหมดเดือนแบบอินไลน์
 */

import React, { useCallback, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MonthlyWrapper, MonthlyDatePickerContainer } from "./styled/MonthlyDate.Styled";
import { th } from "date-fns/locale";
import { subYears, addYears, isSameMonth, isSameYear } from "date-fns";

/* ---------- Types ---------- */
interface MonthlyDateProps {
  /** Callback ส่งค่า Array ของเดือนที่เลือกกลับไป */
  onDateChange?: (dates: Date[]) => void;
  /** ค่าเริ่มต้น (ถ้ามี) */
  defaultSelected?: Date[];
}

/* ---------- Utils ---------- */
const toBuddhistEraYear = (y: number) => y + 543;

/* ---------- Component ---------- */
export const MonthlyDate: React.FC<MonthlyDateProps> = ({ onDateChange, defaultSelected = [] }) => {
  /** State: เก็บรายการเดือนที่ถูกเลือก (Array) */
  const [selectedMonths, setSelectedMonths] = useState<Date[]>(defaultSelected);

  /**
   * Handler: handleMonthClick
   * คำอธิบาย: ระบบ Toggle (เลือก/ยกเลิก) เดือนที่คลิก
   */
  const handleMonthClick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      setSelectedMonths((prev) => {
        // เช็คว่าเดือนนี้ถูกเลือกไปหรือยัง?
        const exists = prev.some((d) => isSameMonth(d, date) && isSameYear(d, date));

        let newSelection: Date[];
        if (exists) {
          // ถ้ามีอยู่แล้ว -> เอาออก (Filter out)
          newSelection = prev.filter((d) => !(isSameMonth(d, date) && isSameYear(d, date)));
        } else {
          // ถ้ายังไม่มี -> เพิ่มเข้าไป
          newSelection = [...prev, date];
        }

        // ส่งค่าออก
        onDateChange?.(newSelection);
        return newSelection;
      });
    },
    [onDateChange]
  );

  /** Helper: เช็คสถานะเพื่อใส่ Class ให้ตรงกับ Styled Component เดิม */
  const getMonthClassName = (date: Date) => {
    const isSelected = selectedMonths.some((d) => isSameMonth(d, date) && isSameYear(d, date));
    // ถ้าถูกเลือก ให้ใส่ class '--range-start' เพื่อให้เป็นวงกลมสีเขียวเข้ม (ตามธีมเดิม)
    return isSelected ? "react-datepicker__month-text--range-start" : undefined;
  };

  /** ค่าคงที่ช่วงวันที่อนุญาต */
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => subYears(today, 15), [today]);
  const maxDate = useMemo(() => addYears(today, 2), [today]);

  /** ช่วงปี (ค.ศ.) ที่ใช้เรนเดอร์ dropdown */
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i),
    [minYear, maxYear]
  );

  return (
    <MonthlyWrapper role="group" aria-label="เลือกเดือน">
      <MonthlyDatePickerContainer>
        <DatePicker
          inline
          showMonthYearPicker
          /* ปิดโหมด Range และ Single Select ปกติ เพื่อใช้ Custom Logic */
          selected={undefined}
          onChange={handleMonthClick}
          shouldCloseOnSelect={false}
          /* Custom Class Logic: เพื่อให้สีเขียวขึ้นตามเดือนที่เลือก */
          monthClassName={getMonthClassName as any}
          locale={th}
          dateFormat="MMMM yyyy"
          minDate={minDate}
          maxDate={maxDate}
          /* Header เดิม: ปุ่มเลื่อนปี + dropdown ปี พ.ศ. */
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
            >
              <button
                type="button"
                onClick={() => !prevYearButtonDisabled && decreaseYear()}
                disabled={prevYearButtonDisabled}
                className="react-datepicker__navigation react-datepicker__navigation--previous"
                style={{ position: "static" }}
                aria-label="ปีก่อนหน้า"
              >
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous" />
              </button>

              <select
                value={date.getFullYear()}
                onChange={(e) => changeYear(Number(e.target.value))}
                style={{
                  appearance: "menulist",
                  justifySelf: "center",
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                aria-label="เลือกปี"
              >
                {yearOptions.map((yearCE) => (
                  <option key={yearCE} value={yearCE}>
                    {toBuddhistEraYear(yearCE)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => !nextYearButtonDisabled && increaseYear()}
                disabled={nextYearButtonDisabled}
                className="react-datepicker__navigation react-datepicker__navigation--next"
                style={{ position: "static" }}
                aria-label="ปีถัดไป"
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
