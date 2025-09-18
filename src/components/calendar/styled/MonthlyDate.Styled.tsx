/* 
 * คำอธิบาย: Styled-components สำหรับ Monthly DatePicker
 * ใช้จัด layout และปรับสไตล์ react-datepicker เฉพาะโหมดเลือก "เดือน"
 */
import styled from "styled-components";


/* 
 * Component: MonthlyWrapper
 * คอนเทนเนอร์หลัก จัด layout แบบ column ตรงกลาง
 */
export const MonthlyWrapper = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
`;

/* 
 * Component: MonthlyDatePickerContainer
 * กำหนดสไตล์ของ react-datepicker ในโหมดเลือกเดือน เช่น
 * - ขนาด cell
 * - header
 * - layout ของเดือน (grid 3 คอลัมน์)
 * - สไตล์ hover, selected, focus
 */
export const MonthlyDatePickerContainer = styled.div`
    --radius: 12px;
    --green-hover:   #bfeed4;  
    --green-anchor:  #34d399;  

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
        padding-top: 12px;
    }

    && .react-datepicker__current-month,
    && .react-datepicker-year-header {
        font-weight: 400;
    }

    && .react-datepicker__month-container {
        width: 100% !important;
        float: none !important;
    }

    && .react-datepicker__month-wrapper {
        width: 100% !important;
        display: grid;
        grid-template-columns: repeat(3, 1fr);   
        gap: 10px 14px;
        padding: 12px 16px 8px;
        justify-content: stretch;
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
    }

    && .react-datepicker__month-text:hover {
        background: var(--green-hover);
        color: #fff;
    }

    && .react-datepicker__month-text--selected,
    && .react-datepicker__month-text--keyboard-selected {
        background: transparent;
        color: inherit;
    }

    && .rp-month-selected {
        background: var(--green-anchor);
        color: #fff;
        font-weight: 700;
    }

    && .rp-month-inrange {
        background: var(--green-inrange);
        color: #fff;
    }

    && .react-datepicker__month-text:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--green-anchor);
    }
`;
