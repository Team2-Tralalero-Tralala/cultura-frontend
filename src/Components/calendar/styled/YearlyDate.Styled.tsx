/*
 * File: styled/YearlyDate.Styled.tsx
 * Component Set: YearlyWrapper, YearlyDatePickerContainer
 * บทบาท:
 *   - สไตล์ react-datepicker โหมด "เลือกปี" (Range)
 *   - Layout: Grid 3 คอลัมน์ (12 ปี), Gap 10px 14px, สูง 3rem (อ้าง Monthly)
 *   - ธีมสี: Start/Selected = เขียวเข้ม, InRange/End/Hover = เขียวอ่อน
 */

import styled from "styled-components";

/*
 * Component: YearlyWrapper
 * คำอธิบาย: คอนเทนเนอร์หลักจัดแนวตั้งและจัดกึ่งกลาง
 * Input : -
 * Output: <div> สำหรับวางหัวข้อ/ตัวเลือกปี/DatePicker
 */
export const YearlyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/*
 * Component: YearlyDatePickerContainer
 * คำอธิบาย: สไตล์ react-datepicker สำหรับโหมดเลือกปีแบบช่วง (range)
 * - ใช้ตัวแปรธีม: --radius, --green-light, --green-strong ให้สื่อความหมาย
 * - โฟกัสด้วย :focus-visible และมีโครงสร้าง Grid 3 คอลัมน์
 */
export const YearlyDatePickerContainer = styled.div`
  /* --- Theme Tokens --- */
  --radius: 20px;
  /* สีเขียวอ่อน (ใช้กับ In Range / Hover) */
  --green-light: rgb(209, 250, 229);
  /* สีเขียวเข้ม (ใช้กับ Start / Selected) */
  --green-dark: rgb(52, 211, 153);

  /* กล่องหลักของ datepicker */
  && .react-datepicker {
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

  /* ปุ่มนำทาง ซ้าย/ขวา */
  && .react-datepicker__navigation {
    top: 27px !important;
    width: 28px;
    height: 28px;
  }
  && .react-datepicker__navigation--previous {
    left: 12px;
  }
  && .react-datepicker__navigation--next {
    right: 12px;
  }

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

  /* ส่วนหัว */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding-top: 12px;
    padding-bottom: 8px;
  }

  /* ซ่อนส่วนที่ไม่ใช้ */
  && .react-datepicker__month-dropdown-container--select {
    display: none !important;
  }
  && .react-datepicker__current-month {
    display: none !important;
  }

  /* ===== Layout Grid สำหรับปี (Year) ===== */
  && .react-datepicker__year-container {
    width: 100% !important;
    float: none !important;
  }

  && .react-datepicker__year-wrapper {
    width: 100% !important;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 14px;
    padding: 12px 16px 8px;
    justify-items: stretch;
  }

  /* การ์ดของ "ปี" แต่ละช่อง */
  && .react-datepicker__year-text {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100% !important;
    height: 3rem;
    box-sizing: border-box;
    margin: 0 !important;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
    border-radius: 12px;
  }

  /* ===== Color Logic ===== */

  /* 1) Start / Selected */
  && .react-datepicker__year-text--range-start,
  && .react-datepicker__year-text--selected {
    background-color: var(--green-dark) !important;
    color: #fff !important;
    font-weight: 700;
  }

  /* 2) In Range / End / Selecting */
  && .react-datepicker__year-text--in-range:not(.react-datepicker__year-text--range-start),
  && .react-datepicker__year-text--range-end:not(.react-datepicker__year-text--range-start),
  && .react-datepicker__year-text--in-selecting-range:not(.react-datepicker__year-text--range-start) {
    background-color: var(--green-light) !important;
    color: #000 !important;
  }

  /* 3) Hover */
  && .react-datepicker__year-text:not(.react-datepicker__year-text--disabled):hover {
    background-color: var(--green-light);
    color: #000;
  }
  && .react-datepicker__year-text--range-start:hover {
    background-color: var(--green-dark) !important;
    color: #fff !important;
  }

  /* 4) Keyboard Focus */
  && .react-datepicker__year-text--keyboard-selected:not(.react-datepicker__year-text--range-start):not(.react-datepicker__year-text--selected) {
    background-color: transparent !important;
    color: inherit !important;
    border: 1px solid var(--green-dark);
  }

  /* 5) Current Year (Today): ขอบเขียว ถ้ายังไม่ได้ถูกเลือก */
  && .react-datepicker__year-text--today:not(.react-datepicker__year-text--range-start):not(.react-datepicker__year-text--range-end):not(.react-datepicker__year-text--in-range):not(.react-datepicker__year-text--selected) {
    border: 1px solid var(--green-dark) !important;
    color: var(--green-dark) !important;
    background-color: transparent !important;
    font-weight: 700;
  }
`;
