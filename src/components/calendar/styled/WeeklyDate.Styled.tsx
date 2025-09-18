import styled from "styled-components";

export const WeeklyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const WeeklyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
`;

export const WeeklyInfo = styled.p`
  color: #4b5563;
`;

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

    && .react-datepicker__navigation {
      top: 16px !important;
    } 


    && .react-datepicker__header {
      background: #ffff;
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
      padding: 6px 0 12px; /* เอา padding ข้างออกให้ตรงกับ header */
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
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }


    /* Hover ระหว่างเลือกช่วง (ยังไม่กด end) */
    && .react-datepicker__day--in-selecting-range {
      background: #bfeed4 !important; /* เขียวอ่อนแทนฟ้า */
      color: #065f46 !important;
    }

    /* Hover วันที่เริ่มตอนเลือก */
    && .react-datepicker__day--selecting-range-start {
      background: #34d399 !important;
      color: #fff !important;
      border-radius: 50% !important;
    }

    /* Hover วันที่สิ้นสุดตอนเลือก */
    && .react-datepicker__day--selecting-range-end {
      background: #34d399 !important;
      color: #fff !important;
      border-radius: 50% !important;
    }



    /* วันที่อยู่ในช่วง (หลังเลือกเสร็จ) */
    && .react-datepicker__day--in-range {
      background: #d1fae5 !important;  /* เขียวอ่อน */
      color: #065f46 !important;
    }

    /* วันที่เริ่มต้นของช่วง */
    && .react-datepicker__day--range-start {
      background: #34d399 !important;  /* เขียวเข้ม */
      color: #fff !important;
      border-radius: 50% !important;
    }

    /* วันที่สิ้นสุดของช่วง */
    && .react-datepicker__day--range-end {
      background: #34d399 !important;  /* เขียวเข้ม */
      color: #fff !important;
      border-radius: 50% !important;
    }
    && .react-datepicker__day--in-range:hover,
    && .react-datepicker__day--range-start:hover,
    && .react-datepicker__day--range-end:hover {
      background: #bfeed4;
    }

    && .react-datepicker__day--outside-month.react-datepicker__day--in-range,
    && .react-datepicker__day--outside-month.react-datepicker__day--range-start,
    && .react-datepicker__day--outside-month.react-datepicker__day--range-end {
      background: #d9f6e5;
      color: #1f2937;
    }

    && .react-datepicker__day--outside-month {
      color: #d1d5db !important;   /* เทาอ่อน */
      font-weight: 400 !important; /* ไม่หนา */
    }


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


