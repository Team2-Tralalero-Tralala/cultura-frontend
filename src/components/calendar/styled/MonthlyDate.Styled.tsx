/* 
 * File: styled/MonthlyDate.Styled.ts
 * Component Set: MonthlyWrapper, MonthlyDatePickerContainer
 * คำอธิบาย: สไตล์ react-datepicker โหมด "เลือกเดือน" โดยแสดงเฉพาะ Year dropdown (พ.ศ.)
 * - ซ่อน month dropdown และ current-month header → เหลือเฉพาะปี (พ.ศ.) ตรงกลาง
 * - คงตำแหน่งลูกศรซ้าย/ขวาแบบเดิม และเพิ่ม focus-visible ring
 * หมายเหตุ: การแปลงข้อความปีเป็น พ.ศ. ทำในคอมโพเนนต์ TSX (patch 543) ไม่ใช่ใน CSS
 */

import styled from "styled-components";

export const MonthlyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const MonthlyDatePickerContainer = styled.div`
  --radius: 20px;
  --green-hover: #bfeed4;
  --green-anchor: #34d399;

  && .react-datepicker {
    border: none;
    border-radius: var(--radius);
    box-shadow: 0 18px 40px rgba(0,0,0,0.12);
    overflow: hidden;
    padding: 12px 12px 16px;
    width: 305px;
    max-width: 100%;
    background: #fff;
  }

  /* ปุ่มนำทางซ้าย/ขวา */
  && .react-datepicker__navigation {
    top: 27px !important; /* unified position */
    width: 28px;
    height: 28px;
  }
  && .react-datepicker__navigation--previous { left: 12px; }
  && .react-datepicker__navigation--next { right: 12px; }

  /* รูปลูกศรให้ชี้ถูกทิศและกึ่งกลางแนวตั้ง */
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

  /* Header */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding-top: 12px;
    padding-bottom: 8px;
  }

  /* ซ่อน month dropdown → เหลือเฉพาะ year dropdown */
  && .react-datepicker__month-dropdown-container--select { 
    display: none !important; 
  }

  /* ซ่อน h2 ปัจจุบัน (เช่น "October 2025") ให้เหลือเฉพาะปี */
  && .react-datepicker__current-month { 
    display: none !important; 
  }

  /* จัด year dropdown ให้อยู่กลาง และเว้นระยะสวยงาม */
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
  }

  /* กริดเดือน (เดิม) */
  && .react-datepicker__month-container { width: 100% !important; float: none !important; }
  && .react-datepicker__month-wrapper {
    width: 100% !important;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 14px;
    padding: 12px 16px 8px;
    justify-items: stretch;
  }
  && .react-datepicker__month-text {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100% !important;
    height: 3rem;
    box-sizing: border-box;
    margin: 0 !important;
    background: transparent;
    color: inherit;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  && .react-datepicker__month-text:hover { 
    background: var(--green-hover); 
    color: #fff; 
  }
  && .react-datepicker__month-text--selected,
  && .react-datepicker__month-text--keyboard-selected {
    background: var(--green-anchor);
    color: #fff;
    font-weight: 700;
  }
`;
