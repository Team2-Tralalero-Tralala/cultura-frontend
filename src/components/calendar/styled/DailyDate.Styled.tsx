/* 
 * คำอธิบาย: Styled-components สำหรับ Daily DatePicker
 * ครอบคลุมโครงสร้างหลัก (Wrapper, Title, Info) 
 * และสไตล์ของ react-datepicker (container, header, day, week)
 */
import styled from "styled-components";

/* 
 * Component: DailyWrapper
 * ใช้เป็นคอนเทนเนอร์หลัก จัด layout แบบ column ตรงกลาง
 */
export const DailyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

/* 
 * Component: DailyTitle
 * สไตล์หัวข้อ (Title) ขนาดใหญ่ น้ำหนักกลาง
 */
export const DailyTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
`;

/* 
 * Component: DailyInfo
 * ข้อความเพิ่มเติม/คำอธิบาย ใช้สีเทา
 */
export const DailyInfo = styled.p`
    color: #4b5563;
`;

/* 
 * Component: DailyDatePickerContainer
 * กำหนดสไตล์เฉพาะให้ react-datepicker เช่น ขนาดช่องวัน, header, 
 * day name, การเลือกวัน และการ hover
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

    && .react-datepicker__navigation {
        top: 16px !important; /* ปรับให้ตรงกับ header */
    }


    && .react-datepicker__header {
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        padding: 12px 12px 8px;
    }

    && .react-datepicker__current-month {
        font-weight: 400;
    }

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
    }

    && .react-datepicker__day:not(.react-datepicker__day--selected):hover {
        background: #f3f4f6;
    }

    && .react-datepicker__day--outside-month {
        color: #cbd5e1;
    }

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
