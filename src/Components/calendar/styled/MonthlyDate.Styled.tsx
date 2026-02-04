/*
 * File: styled/MonthlyDate.Styled.ts
 * Component Set: MonthlyWrapper, MonthlyDatePickerContainer
 */

import styled from "styled-components";

/* ===== Wrapper หลักของส่วน Monthly Picker =====
 * - จัดเรียงแนวตั้งและกึ่งกลาง
 */
export const MonthlyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/* ===== Container ครอบ react-datepicker สำหรับโหมด Month =====
 * - กำหนดธีม/รัศมีโค้งผ่าน CSS Variables
 * - อธิบายแต่ละส่วนของ react-datepicker ให้ชัดเจน
 */
export const MonthlyDatePickerContainer = styled.div`
  /* --- Theme Tokens (Custom Properties) --- */
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
    overflow: hidden; /* ป้องกัน child เกินขอบโค้ง */
    padding: 12px 12px 16px;
    width: 305px;
    max-width: 100%;
    background: #fff;
    font-family: inherit;
  }

  /* ปุ่มนำทาง ซ้าย/ขวา (เดือนก่อน/หลัง) */
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

  /* ปรับไอคอนลูกศร */
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

  /* A11y: แสดงแหวนโฟกัสเมื่อใช้คีย์บอร์ด */
  && .react-datepicker__navigation:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
    border-radius: 6px;
  }

  /* ส่วนหัวของ datepicker */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb; /* ขอบบาง ๆ แบ่งส่วน */
    padding-top: 12px;
    padding-bottom: 8px;
  }

  /* ซ่อนส่วนที่ไม่ใช้ในโหมด Month (dropdown เดือน/หัวเดือนปัจจุบัน) */
  && .react-datepicker__month-dropdown-container--select {
    display: none !important;
  }
  && .react-datepicker__current-month {
    display: none !important;
  }

  /* กล่องครอบ dropdown ปี */
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
    cursor: pointer;
  }
  && .react-datepicker__year-select:focus-visible {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
  }

  /* ===== Layout Grid สำหรับเดือน ===== */
  /* ให้ container ของ month ขยายเต็ม กำจัด float เริ่มต้น */
  && .react-datepicker__month-container {
    width: 100% !important;
    float: none !important;
  }

  /* วางเดือนเป็นกริด 3 คอลัมน์ พร้อมระยะห่างตามดีไซน์ */
  && .react-datepicker__month-wrapper {
    width: 100% !important;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 14px; /* row-gap column-gap */
    padding: 12px 16px 8px;
    justify-items: stretch; /* การ์ดกว้างเต็มคอลัมน์ */
  }

  /* การ์ดของ "เดือน" แต่ละช่อง */
  && .react-datepicker__month-text {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100% !important;
    height: 3rem; /* ขนาดช่อง */
    box-sizing: border-box;
    margin: 0 !important;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
    border-radius: 12px; /* มนทุกมุม เพราะมี gap แยกการ์ด */
  }

  /* ===== Color Logic (ธีมเขียวเข้ม/เขียวอ่อน) ===== */

  /* 1) Start / Selected: พื้นหลังเขียวเข้ม ตัวอักษรขาว */
  && .react-datepicker__month-text--range-start,
  && .react-datepicker__month-text--selected {
    background-color: var(--green-dark) !important;
    color: #fff !important;
    font-weight: 700;
  }

  /* 2) In Range / End / Selecting: พื้นหลังเขียวอ่อน ตัวอักษรดำ */
  && .react-datepicker__month-text--in-range:not(.react-datepicker__month-text--range-start),
  && .react-datepicker__month-text--range-end:not(.react-datepicker__month-text--range-start),
  && .react-datepicker__month-text--in-selecting-range:not(.react-datepicker__month-text--range-start) {
    background-color: var(--green-light) !important;
    color: #000 !important;
  }

  /* 3) Hover: เติมสีเขียวอ่อน (ยกเว้น Start ให้คงเขียวเข้ม) */
  && .react-datepicker__month-text:not(.react-datepicker__month-text--disabled):hover {
    background-color: var(--green-light);
    color: #000;
  }
  && .react-datepicker__month-text--range-start:hover {
    background-color: var(--green-dark) !important;
    color: #fff !important;
  }

  /* 4) Keyboard Focus: เน้นขอบเฉพาะตัวที่ *ยังไม่ได้เลือก* (แก้ปัญหาขอบเขียวทับพื้นหลังเขียวเข้ม) */
  && .react-datepicker__month-text--keyboard-selected:not(.react-datepicker__month-text--range-start):not(.react-datepicker__month-text--selected) {
    background-color: transparent !important;
    color: inherit !important;
    border: 1px solid var(--green-dark);
  }

  /* 5) Current Month (Today): ขอบเขียว ถ้ายังไม่ได้ถูกเลือก */
  && .react-datepicker__month-text--today:not(.react-datepicker__month-text--range-start):not(.react-datepicker__month-text--range-end):not(.react-datepicker__month-text--in-range):not(.react-datepicker__month-text--selected) {
    border: 1px solid var(--green-dark) !important;
    color: var(--green-dark) !important;
    background-color: transparent !important;
    font-weight: 700;
  }
`;
