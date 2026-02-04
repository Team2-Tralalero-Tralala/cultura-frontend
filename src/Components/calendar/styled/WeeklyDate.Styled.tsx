/*
 * File: styled/WeeklyDate.Styled.tsx
 * Component Set: WeeklyWrapper, WeeklyTitle, WeeklyInfo, WeeklyDatePickerContainer
 * บทบาท:
 *   - สไตล์ react-datepicker สำหรับโหมด "เลือกช่วงสัปดาห์ (range)"
 *   - จัดวาง Layout ของหัวข้อ/คำอธิบาย และกล่อง datepicker
 *   - ปรับโทนสี/โครงร่างให้เห็นช่วงสัปดาห์เป็นแถบ (pill) ต่อเนื่อง
 */

import styled from "styled-components";

/*
 * Component: WeeklyWrapper
 * คำอธิบาย: คอนเทนเนอร์หลักของปฏิทินสัปดาห์ จัดเรียงแนวตั้งและจัดกึ่งกลาง
 * Input : -
 * Output: <div> สำหรับวาง Title/Info/DatePicker
 */
export const WeeklyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/*
 * Component: WeeklyTitle
 * คำอธิบาย: ข้อความหัวเรื่องสำหรับส่วนปฏิทิน
 * Input : -
 * Output: <h2>
 */
export const WeeklyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
`;

/*
 * Component: WeeklyInfo
 * คำอธิบาย: คำอธิบายสั้น ๆ ใต้หัวเรื่อง ใช้สีเทากลาง
 * Input : -
 * Output: <p>
 */
export const WeeklyInfo = styled.p`
  color: #4b5563;
`;

/*
 * Component: WeeklyDatePickerContainer
 * คำอธิบาย: สไตล์เฉพาะของ react-datepicker (โหมดสัปดาห์/ช่วง)
 * - ปรับขนาดช่องวันด้วยตัวแปร --day-size
 * - จัดหัวตาราง/ปุ่มนำทาง/ชื่อวันให้ตรงกลาง
 * - สีกลุ่มสถานะ: hover / in-range / start / end และโฟกัสด้วย :focus-visible
 * หมายเหตุ: ใช้ '&&' เพื่อกันสไตล์รั่วออกนอกคอมโพเนนต์
 */
export const WeeklyDatePickerContainer = styled.div`
  /* ---- Theme Tokens ---- */
  && .react-datepicker {
    --day-size: 2.4rem;
    --radius: 20px;
    --green-light: rgb(209, 250, 229);  /* เขียวอ่อน */
    --green-strong: rgb(52, 211, 153); /* เขียวเข้ม */

    border: none;
    border-radius: var(--radius);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    padding: 12px 12px 16px;
    width: 305px;
    max-width: 100%;
    background: #fff;
    font-family: inherit;
  }

  /* ---- Header ---- */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 12px 8px;
  }

  && .react-datepicker__header__dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  && .react-datepicker__current-month {
    display: none;
  }

  && .react-datepicker__month-select,
  && .react-datepicker__year-select {
    height: 32px;
    padding: 0 8px;
    border: 0;
    border-radius: 8px;
    background: #fff;
    font-size: 0.9rem;
    outline: none;
    cursor: pointer;
  }
  && .react-datepicker__month-select:focus-visible,
  && .react-datepicker__year-select:focus-visible {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
  }

  /* ---- Navigation ---- */
  && .react-datepicker__navigation {
    top: 27px !important;
    width: 28px;
    height: 28px;
  }
  && .react-datepicker__navigation--previous { left: 12px; }
  && .react-datepicker__navigation--next { right: 12px; }
  
  && .react-datepicker__navigation--previous .react-datepicker__navigation-icon::before {
    top: 50% !important;
    margin-top: 0 !important;
    transform: translateY(-50%) rotate(225deg) !important;
  }
  && .react-datepicker__navigation--next .react-datepicker__navigation-icon::before {
    top: 50% !important;
    margin-top: 0 !important;
    transform: translateY(-50%) rotate(45deg) !important;
  }
  && .react-datepicker__navigation:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
    border-radius: 6px;
  }

  /* ---- Day Grid ---- */
  && .react-datepicker__day-names {
    display: grid;
    grid-template-columns: repeat(7, var(--day-size));
    justify-content: center;
    margin-top: 8px;
    gap: 0;
  }
  && .react-datepicker__day-name {
    width: var(--day-size);
    height: var(--day-size);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667085;
    font-weight: 500;
  }

  && .react-datepicker__month { padding: 6px 0 12px; }
  && .react-datepicker__week {
    display: grid;
    grid-template-columns: repeat(7, var(--day-size));
    justify-content: center;
    gap: 0;
  }
  && .react-datepicker__day {
    margin: 0;
    width: var(--day-size);
    height: var(--day-size);
    line-height: var(--day-size);
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
    color: #111827;
  }

  /* ============================================================
     FIXED SECTION: Specificity & Pill Shape Logic
     ============================================================ */

  /* 1. ช่วงกลาง (In Range) -> สี่เหลี่ยมเขียวอ่อน */
  && .react-datepicker__week .react-datepicker__day--in-range,
  && .react-datepicker__week .react-datepicker__day--in-selecting-range {
    background-color: var(--green-light) !important;
    color: #065f46 !important;
    border-radius: 0 !important;
  }

  /* 2. วันเริ่ม (Start) -> มนซ้าย 50% (เป็นหัวแถบ) */
  && .react-datepicker__week .react-datepicker__day--range-start:not(.react-datepicker__day--range-end),
  && .react-datepicker__week .react-datepicker__day--selecting-range-start:not(.react-datepicker__day--selecting-range-end) {
    background-color: var(--green-strong) !important;
    color: #fff !important;
    border-radius: 50% 0 0 50% !important; /* ซ้ายมน ขวาเหลี่ยม */
    position: relative;
    z-index: 2;
  }

  /* 3. วันจบ (End) -> มนขวา 50% (เป็นท้ายแถบ) */
  && .react-datepicker__week .react-datepicker__day--range-end:not(.react-datepicker__day--range-start),
  && .react-datepicker__week .react-datepicker__day--selecting-range-end:not(.react-datepicker__day--selecting-range-start) {
    background-color: var(--green-strong) !important;
    color: #fff !important;
    border-radius: 0 50% 50% 0 !important; /* ซ้ายเหลี่ยม ขวามน */
    position: relative;
    z-index: 2;
  }

  /* 4. วันเดียว (Start = End) -> วงกลม 50% */
  && .react-datepicker__week .react-datepicker__day--range-start.react-datepicker__day--range-end,
  && .react-datepicker__week .react-datepicker__day--selecting-range-start.react-datepicker__day--selecting-range-end {
    background-color: var(--green-strong) !important;
    color: #fff !important;
    border-radius: 50% !important;
    position: relative;
    z-index: 2;
  }

  /* 5. จัดการกรณี Keyboard Selected ทับซ้อน */
  && .react-datepicker__day--keyboard-selected.react-datepicker__day--range-start,
  && .react-datepicker__day--keyboard-selected.react-datepicker__day--range-end {
    background-color: var(--green-strong) !important;
    color: #fff !important;
  }

  /* 6. Pill Effect: มุมมนสำหรับช่วงกลางที่อยู่หัว/ท้ายแถว (กรณีข้ามสัปดาห์) */
  && .react-datepicker__week .react-datepicker__day--in-range:first-child:not(.react-datepicker__day--range-end) {
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }
  && .react-datepicker__week .react-datepicker__day--in-range:last-child:not(.react-datepicker__day--range-start) {
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }

  /* 7. Hover State */
  && .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end):hover {
    background-color: #bfeed4 !important;
  }

  /* 8. วันนอกเดือน */
  && .react-datepicker__day--outside-month {
    color: #d1d5db !important;
  }
  && .react-datepicker__day--outside-month.react-datepicker__day--in-range {
    background-color: rgba(209, 250, 229, 0.5) !important;
  }

  /* 9. Keyboard Focus ปกติ */
  && .react-datepicker__day--keyboard-selected:not(.react-datepicker__day--in-range):not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
    background-color: transparent !important;
    color: inherit !important;
    border: none !important; 
  }

  /* 10. วันปัจจุบัน (Today) */
  /* ถ้าไม่ได้ถูกเลือก (ไม่อยู่ใน Range/Start/End) ให้แสดงขอบสีเขียว */
  && .react-datepicker__day--today:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end):not(.react-datepicker__day--in-range) {
    border: 1px solid var(--green-strong) !important;
    border-radius: 50% !important;
    color: var(--green-strong) !important;
    font-weight: 600;
    background-color: transparent !important;
  }
`;
