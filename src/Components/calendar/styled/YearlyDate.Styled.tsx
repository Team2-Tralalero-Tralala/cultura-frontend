/* * File: styled/YearlyDate.Styled.ts
 * Component Set: YearlyWrapper, YearlyDatePickerContainer
 * คำอธิบาย: สไตล์ react-datepicker โหมด "เลือกปี" (ใช้ Layout ตาราง 3x3 และสไตล์การไฮไลต์เหมือนเดือน)
 * [FIXED] ล้าง Margin/Padding เพื่อให้ขนาดช่องเท่ากัน
 */

import styled from "styled-components";

export const YearlyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const YearlyDatePickerContainer = styled.div`
  --radius: 20px;
  --green-hover: #bfeed4;
  --green-anchor: #34d399;

  && .react-datepicker {
    border: none;
    border-radius: var(--radius);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    padding: 12px 12px 16px;
    width: 305px;
    max-width: 100%;
    background: #fff;
  }

  /* ปุ่มนำทางซ้าย/ขวา */
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

  /* รูปลูกศร */
  && .react-datepicker__navigation--previous
    .react-datepicker__navigation-icon::before {
    top: 50% !important;
    margin-top: 0 !important;
    transform: translateY(-50%) rotate(225deg) !important;
  }
  && .react-datepicker__navigation--next
    .react-datepicker__navigation-icon::before {
    top: 50% !important;
    margin-top: 0 !important;
    transform: translateY(-50%) rotate(45deg) !important;
  }
  && .react-datepicker__navigation:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
    border-radius: 6px;
  }

  /* Header */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding-top: 12px;
    padding-bottom: 8px;
  }

  /* ซ่อน Elements ที่ไม่ต้องการใน Header */
  && .react-datepicker__month-dropdown-container--select {
    display: none !important;
  }
  && .react-datepicker__current-month {
    display: none !important;
  }
  && .react-datepicker__header__dropdown select:nth-child(1) {
    display: none !important;
  }

  /* จัด year dropdown */
  && .react-datepicker__header__dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  && .react-datepicker__year-dropdown-container--select {
    display: flex;
    justify-content: center;
  }
  && .react-datepicker__year-select {
    height: 32px;
    padding: 0 10px;
    min-width: 92px;
    border: 0;
    border-radius: 8px;
    background: #fff;
    font-size: 0.875rem;
    outline: none;
  }
  && .react-datepicker__year-select:focus-visible {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
    border-radius: 6px;
  }

  /* VVVV [FINAL FIX] ล้าง Margin/Padding ของคอนเทนเนอร์หลักของปี VVVV */
  && .react-datepicker__year {
    margin: 0 !important; 
    padding-top: 0 !important; /* ล้าง padding-top */
    padding-bottom: 0 !important; /* ล้าง padding-bottom */
  }
  /* ^^^^ [FINAL FIX] ล้าง Margin/Padding ของคอนเทนเนอร์หลักของปี VVVV */

  /* กริดปี = layout เดิมของเดือน */
  && .react-datepicker__year--container {
    width: 100% !important;
    float: none !important;
  }
  && .react-datepicker__year-wrapper {
    width: 100% !important;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 14px;
    padding: 12px 16px 8px; /* Padding ของ wrapper นี้ต้องเท่ากับ month-wrapper */
    justify-items: stretch;
  }

  /* เซลล์ปี = styled เดียวกับเซลล์เดือน */
  && .react-datepicker__year-text {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100% !important;
    height: 3rem; /* ความสูงช่องเท่าเดิม */
    box-sizing: border-box;
    margin: 0 !important; /* ล้าง margin ของเซลล์ */
    background: transparent;
    color: inherit;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  && .react-datepicker__year-text:hover {
    background: var(--green-hover);
    color: #fff;
  }
  && .react-datepicker__year-text--selected,
  && .react-datepicker__year-text--keyboard-selected,
  && .rp-month-selected {
    background: var(--green-anchor);
    color: #fff;
    font-weight: 700;
  }
`;