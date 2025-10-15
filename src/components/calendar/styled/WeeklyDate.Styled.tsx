/*
 * File: styled/WeeklyDate.Styled.tsx
 * Component Set: WeeklyWrapper, WeeklyTitle, WeeklyInfo, WeeklyDatePickerContainer
 * คำอธิบาย: ชุดสไตล์ของ react-datepicker สำหรับโหมด "เลือกช่วงสัปดาห์ (range)"
 * - Layout หลัก (Wrapper/Title/Info)
 * - ปรับหน้าตา header, navigation, ชื่อวัน/สัปดาห์, โทนสี hover/selected
 * - ช่วงสัปดาห์แสดงเป็นแถบ pill ต่อเนื่อง (ต่อแถว)
 * มาตรฐาน: คอมเมนต์หัวไฟล์/ฟังก์ชันตาม CS v1.1.1, ไม่ใช้ any, ชื่อ Component เป็น PascalCase
 */

import styled from "styled-components";

/*
 * Component: WeeklyWrapper
 * คำอธิบาย: คอนเทนเนอร์หลักของปฏิทินสัปดาห์ จัดเรียงคอลัมน์และกึ่งกลาง
 * Input : -
 * Output: <div> ที่ใช้วาง Title/Info/DatePicker
 */
export const WeeklyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/*
 * Component: WeeklyTitle
 * คำอธิบาย: ข้อความหัวเรื่องขนาดกลาง-ใหญ่ ใช้กับหัวปฏิทิน
 * Input : -
 * Output: <h2>
 */
export const WeeklyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
`;

/*
 * Component: WeeklyInfo
 * คำอธิบาย: ข้อความคำอธิบายสั้น ๆ ใต้หัวเรื่อง ใช้สีเทา
 * Input : -
 * Output: <p>
 */
export const WeeklyInfo = styled.p`
  color: #4b5563;
`;

/*
 * Component: WeeklyDatePickerContainer
 * คำอธิบาย: สไตล์เฉพาะของ react-datepicker สำหรับโหมดสัปดาห์ (range)
 * - ปรับขนาดเซลล์ (--cell)
 * - จัดตำแหน่ง header, ปุ่มนำทาง, ชื่อวัน/สัปดาห์
 * - โทนสี hover/selected + pill ต่อแถวสำหรับช่วง
 * หมายเหตุ: ใช้ "&&" เพื่อเพิ่ม specificity ป้องกันสไตล์รั่วออกนอกคอมโพเนนต์
 */
export const WeeklyDatePickerContainer = styled.div`
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
    background: #fff; /* FIX: เดิม #ffff */
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 12px 8px;
  }

  /* แถว dropdown เดือน/ปี จัดกลาง + ช่องไฟมาตรฐาน */
  && .react-datepicker__header__dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px; /* FIX: เดิม 'gap: px;' ไม่ถูกต้อง */
  }

  /* ซ่อน h2 ปัจจุบัน เมื่อใช้ dropdown */
  && .react-datepicker__current-month {
    display: none;
    font-weight: 400;
  }

  /* Select เดือน/ปี โค้งเล็ก อ่านง่าย */
  && .react-datepicker__month-select,
  && .react-datepicker__year-select {
    height: 32px;
    padding: 0 8px; /* FIX: เดิม 'padding:' เว้นว่าง */
    border: 0;
    border-radius: 8px;
    background: #fff;
    font-size: 0.9rem;
    outline: none;
  }
  && .react-datepicker__month-select:focus-visible,
  && .react-datepicker__year-select:focus-visible {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35); /* emerald ring */
  }

  /* ปุ่มนำทางซ้าย/ขวา (ขนาดเล็กลง + focus ring) */
  && .react-datepicker__navigation {
    top: 27px !important; /* FIX: เดิม 28px */
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
  && .react-datepicker__month { padding: 6px 0 12px; }
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
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
    color: #111827; /* gray-900 */
  }

  /* Hover ระหว่างกำลังเลือกช่วง (ยังไม่กด end) */
  && .react-datepicker__day--in-selecting-range {
    background: #bfeed4 !important; /* เขียวอ่อนแทนฟ้า */
    color: #065f46 !important;
  }

  /* Hover วันที่เริ่ม/สิ้นสุดตอนเลือก */
  && .react-datepicker__day--selecting-range-start,
  && .react-datepicker__day--selecting-range-end {
    background: #34d399 !important;
    color: #fff !important;
    border-radius: 50% !important;
  }

  /* วันที่อยู่ในช่วง (กลาง ๆ) */
  && .react-datepicker__day--in-range {
    background: #d1fae5 !important;
    color: #065f46 !important;
  }

  /* วันเริ่ม/สิ้นสุดของช่วง */
  && .react-datepicker__day--range-start,
  && .react-datepicker__day--range-end {
    background: #34d399 !important;
    color: #fff !important;
    border-radius: 50% !important;
    position: relative;
    z-index: 2;
  }

  /* --- ทำให้ช่วงเป็น pill ต่อแถว --- */

  /* 1) ทำพื้นช่วงให้เป็นแท่งตรงก่อน */
  && .react-datepicker__week .react-datepicker__day--in-range {
    border-radius: 0 !important;
  }

  /* 2) มุมซ้ายของ segment ภายใน "แถวนั้น" */
  && .react-datepicker__week
    .react-datepicker__day:not(.react-datepicker__day--in-range)
    + .react-datepicker__day--in-range,
  && .react-datepicker__week
    .react-datepicker__day--in-range:first-child {
    border-top-left-radius: 999px !important;
    border-bottom-left-radius: 999px !important;
  }

  /* 3) มุมขวาของ segment ภายใน "แถวนั้น" 
     หมายเหตุ: ใช้ :has ซึ่งเบราว์เซอร์ใหม่รองรับ; ถ้าต้องรองรับเบราว์เซอร์เก่ามาก ๆ 
     ให้พิจารณาเติมคลาสเสริมจากโค้ด JS แทน */
  && .react-datepicker__week
    .react-datepicker__day--in-range:has(+ :not(.react-datepicker__day--in-range)),
  && .react-datepicker__week
    .react-datepicker__day--in-range:last-child {
    border-top-right-radius: 999px !important;
    border-bottom-right-radius: 999px !important;
  }

  /* 4) วันเริ่ม/สิ้นสุด ให้เป็นวงกลมทับบนแถบ */
  && .react-datepicker__day--range-start,
  && .react-datepicker__day--range-end {
    border-radius: 999px !important;
    position: relative;
    z-index: 3;
  }

  /* 5) ช่วงที่เริ่มและจบวันเดียวกัน */
  && .react-datepicker__day--range-start.react-datepicker__day--range-end {
    border-radius: 999px !important;
  }

  /* Hover เพิ่มเติม */
  && .react-datepicker__day--in-range:hover,
  && .react-datepicker__day--range-start:hover,
  && .react-datepicker__day--range-end:hover {
    background: #bfeed4 !important;
  }

  /* ค่าที่อยู่นอกเดือนแต่ติดอยู่ในช่วง */
  && .react-datepicker__day--outside-month.react-datepicker__day--in-range,
  && .react-datepicker__day--outside-month.react-datepicker__day--range-start,
  && .react-datepicker__day--outside-month.react-datepicker__day--range-end {
    background: #d9f6e5 !important;
    color: #1f2937 !important;
  }

  /* วันนอกเดือน (ปกติ) */
  && .react-datepicker__day--outside-month {
    color: #d1d5db !important; /* gray-300 */
    font-weight: 400 !important;
  }

  /* Anchor/selected/keyboard-selected */
  && .rp-anchor,
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

