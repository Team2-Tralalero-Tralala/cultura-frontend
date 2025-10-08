/*
 * File: styled/DailyDate.Styled.tsx
 * Component Set: DailyWrapper, DailyTitle, DailyInfo, DailyDatePickerContainer
 * คำอธิบาย: ชุดสไตล์สำหรับปฏิทินรายวัน (react-datepicker)
 * - จัด layout หลัก (Wrapper/Title/Info)
 * - ปรับหน้าตา react-datepicker แบบ scoped (ใช้ "&&" เพิ่ม specificity)
 * มาตรฐาน: คอมเมนต์หัวไฟล์/ฟังก์ชันตาม CS v1.1.1, ไม่ใช้ any, ชื่อ Component เป็น PascalCase
 */

import styled from "styled-components";

/*
 * Component: DailyWrapper
 * คำอธิบาย: คอนเทนเนอร์หลักของปฏิทิน จัดเรียงแบบคอลัมน์และจัดกึ่งกลาง
 * Input : -
 * Output: <div> ที่ใช้วาง Title/Info/DatePicker
 */
export const DailyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/*
 * Component: DailyTitle
 * คำอธิบาย: ข้อความหัวเรื่องขนาดกลาง-ใหญ่ ใช้กับหัวปฏิทิน
 * Input : -
 * Output: <h2>
 */
export const DailyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
`;

/*
 * Component: DailyInfo
 * คำอธิบาย: ข้อความคำอธิบายสั้น ๆ ใต้หัวเรื่อง ใช้สีเทา
 * Input : -
 * Output: <p>
 */
export const DailyInfo = styled.p`
  color: #4b5563;
`;

/*
 * Component: DailyDatePickerContainer
 * คำอธิบาย: สไตล์เฉพาะของ react-datepicker แบบ scoped ในคอมโพเนนต์นี้
 * - ปรับขนาดเซลล์วันด้วย CSS variable (--cell)
 * - จัดตำแหน่ง header, ปุ่มนำทาง, ชื่อวัน/สัปดาห์, โทนสี hover/selected
 * หมายเหตุ: ใช้ "&&" เพื่อเพิ่ม specificity ป้องกันสไตล์รั่ว
 */
export const DailyDatePickerContainer = styled.div`
  && .react-datepicker {
    --cell: 2.4rem;
    border: none;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    padding: 12px 12px 16px;
    width: 305px;
    max-width: 100%;
    background: #fff;
  }

  /* Header */
  && .react-datepicker__header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb; /* slate-200 */
    padding: 12px 12px 8px;
  }
  

  /* แถว dropdown เดือน/ปี จัดกลาง + ช่องไฟมาตรฐาน */
  && .react-datepicker__header__dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px; /* FIX: เดิม 'gap: px;' ไม่ถูกต้อง */
  }

  /* ซ่อน h2 ปัจจุบัน (เช่น "October 2025") เมื่อใช้ dropdown */
  && .react-datepicker__current-month {
    display: none;
  }

  /* Select เดือน/ปี โค้งเล็ก อ่านง่าย */
  && .react-datepicker__month-select,
  && .react-datepicker__year-select {
    height: 32px;
    padding: 0 8px; /* FIX: เดิม 'padding:' เว้นว่าง */
    border: 0;
    border-radius: 8px;
    background: #fff;
    font-size: 0.9rem; /* text-sm */
    outline: none;
  }
  && .react-datepicker__month-select:focus-visible,
  && .react-datepicker__year-select:focus-visible {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35); /* emerald ring */
  }

  /* ปุ่มนำทางซ้าย/ขวา */
  && .react-datepicker__navigation {
    top: 27px !important; /* unified position */
    width: 28px;
    height: 28px;
  }
  && .react-datepicker__navigation--previous {
    left: 12px;
  }
  && .react-datepicker__navigation--next {
    right: 12px;
  }
  /* รูปลูกศรให้ชี้ถูกทิศและกึ่งกลางแนวตั้ง */
  &&
    .react-datepicker__navigation--previous
    .react-datepicker__navigation-icon::before {
    top: 50% !important;
    margin-top: 0 !important;
    transform: translateY(-50%) rotate(225deg) !important;
  }
  &&
    .react-datepicker__navigation--next
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

  /* ชื่อวัน (อา-ส) */
  && .react-datepicker__day-names {
    display: grid;
    grid-template-columns: repeat(7, var(--cell));
    justify-content: center;
    margin-top: 8px;
    gap: 0;
  }
  && .react-datepicker__day-name {
    width: var(--cell);
    height: var(--cell);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667085;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* ตารางวัน */
  && .react-datepicker__month {
    padding: 6px 0 12px;
  }
  && .react-datepicker__week {
    display: grid;
    grid-template-columns: repeat(7, var(--cell));
    justify-content: center;
    gap: 0;
  }
  && .react-datepicker__day {
    margin: 0;
    width: var(--cell);
    height: var(--cell);
    line-height: var(--cell);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    transition: background 0.15s ease;
    cursor: pointer;
    color: #111827; /* gray-900 */
  }

  && .react-datepicker__day:not(.react-datepicker__day--selected):hover {
    background: #f3f4f6; /* gray-100 */
  }

  && .react-datepicker__day--outside-month {
    color: #cbd5e1; /* slate-300 */
  }

  /* Today indicator (ring) */
  && .react-datepicker__day--today:not(.react-datepicker__day--selected) {
    box-shadow: inset 0 0 0 2px rgba(52, 211, 153, 0.45);
    border-radius: 50%;
  }

  /* Disabled day */
  && .react-datepicker__day--disabled {
    color: #d1d5db; /* gray-300 */
    cursor: not-allowed;
  }

  /* Selected / keyboard-selected */
  && .react-datepicker__day--selected,
  && .react-datepicker__day--keyboard-selected {
    background: #34d399 !important;
    color: #fff !important;
    border-radius: 50% !important;
    width: var(--cell) !important;
    height: var(--cell) !important;
    line-height: var(--cell) !important;
  }


`;
