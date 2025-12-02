/*
 * File: YearlyDate.tsx
 * Component: YearlyDate (Client)
 * หน้าที่:
 * - ปฏิทินเลือก "หลายปีแบบอิสระ" (Multiple Year Selection)
 * - เรียงปีถอยหลังจากปีปัจจุบัน (Descending)
 * - คลิกเพื่อเลือก/ยกเลิก (Toggle) ได้ทีละหลาย ๆ ปี
 * สไตล์:
 * - ใช้โครงสร้าง class ของ react-datepicker เพื่อให้ Styled Component (YearlyDatePickerContainer) ทำงาน
 * อินพุต (Props):
 * - onDateChange?: (years: Date[]) => void   // ส่งค่ากลับเป็น Array ของปีที่เลือก
 * - defaultSelected?: Date[]                 // ค่าเริ่มต้น (ถ้ามี)
 */
import React, { useCallback, useMemo, useState } from "react";
import { YearlyWrapper, YearlyDatePickerContainer } from "./styled/YearlyDate.Styled";

interface YearlyDateProps {
    onDateChange?: (years: Date[]) => void;
    defaultSelected?: Date[];
}

/**
 * ฟังก์ชัน: toBeYear
 * คำอธิบาย: แปลงค.ศ. (AD) → พ.ศ. (BE) เพื่อแสดงผล
 */
const toBeYear = (y: number) => y + 543;

/** ---------- Component ---------- */
export const YearlyDate: React.FC<YearlyDateProps> = ({
    onDateChange,
    defaultSelected = []
}) => {
    /** ---------- State: รายการปีที่เลือก (Array) ---------- */
    const [selectedYears, setSelectedYears] = useState<Date[]>(defaultSelected);

    /**
     * State: pageStartYear
     * คำอธิบาย: ปี “บนสุด” ของหน้าปัจจุบัน (ทำเป็นเพจละ 12 ปี เรียงถอยหลัง)
     */
    const [pageStartYear, setPageStartYear] = useState<number>(new Date().getFullYear());

    /**
     * ค่าคำนวณ: yearsList
     * คำอธิบาย: ลิสต์ 12 ปีสำหรับเพจปัจจุบัน (เรียงถอยหลัง) เช่น 2025 → [2025..2014]
     */
    const yearsList = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => pageStartYear - i);
    }, [pageStartYear]);

    /**
     * ฟังก์ชัน: handlePrevPage
     * คำอธิบาย: เปลี่ยนไปดู “ปีในอนาคต” (ตัวเลขมากขึ้น)
     */
    const handlePrevPage = useCallback(() => {
        setPageStartYear((y) => y + 12);
    }, []);

    /**
     * ฟังก์ชัน: handleNextPage
     * คำอธิบาย: เปลี่ยนไปดู “ปีในอดีต” (ตัวเลขน้อยลง)
     */
    const handleNextPage = useCallback(() => {
        setPageStartYear((y) => y - 12);
    }, []);

    /**
     * ฟังก์ชัน: handleYearClick
     * คำอธิบาย: ระบบ Toggle (เลือก/ยกเลิก) ปีที่คลิก
     */
    const handleYearClick = (year: number) => {
        const clickedDate = new Date(year, 0, 1);

        setSelectedYears((prev) => {
            // เช็คว่าปีนี้มีอยู่แล้วไหม?
            const exists = prev.some((d) => d.getFullYear() === year);
            let newSelection: Date[];

            if (exists) {
                // มีแล้ว -> เอาออก
                newSelection = prev.filter((d) => d.getFullYear() !== year);
            } else {
                // ยังไม่มี -> เพิ่มเข้าไป
                newSelection = [...prev, clickedDate];
            }

            // ส่งค่าออก
            onDateChange?.(newSelection);
            return newSelection;
        });
    };

    /**
     * ฟังก์ชัน: getYearClass
     * คำอธิบาย: คืนชื่อคลาสเพื่อให้ Styled Component แสดงผล
     */
    const getYearClass = (year: number) => {
        const isSelected = selectedYears.some((d) => d.getFullYear() === year);
        const isToday = year === new Date().getFullYear(); // เช็คว่าเป็นปีปัจจุบันหรือไม่

        let classes = "react-datepicker__year-text";

        if (isSelected) {
            // ใส่ class --selected เพื่อให้ได้สีเขียวเข้ม (Start Color)
            classes += " react-datepicker__year-text--selected";
        }

        if (isToday) {
            // ใส่ class --today เพื่อให้ CSS ไปทำขอบเขียว (ถ้ายังไม่ได้เลือก)
            classes += " react-datepicker__year-text--today";
        }

        return classes;
    };

    /** ---------- Render ---------- */
    return (
        <YearlyWrapper role="group" aria-label="เลือกปี">
            <YearlyDatePickerContainer>
                {/* โครงสร้างจำลอง react-datepicker */}
                <div className="react-datepicker">
                    {/* Header */}
                    <div className="react-datepicker__header">
                        <div
                            style={{
                                position: "relative",
                                display: "grid",
                                gridTemplateColumns: "40px 1fr 40px",
                                alignItems: "center",
                            }}
                        >
                            {/* ปุ่มซ้าย: ไปยังเพจที่ “ใหม่กว่า” (อนาคต) */}
                            <button
                                type="button"
                                onClick={handlePrevPage}
                                className="react-datepicker__navigation react-datepicker__navigation--previous"
                                style={{ position: "static" }}
                                aria-label="ไปยังชุดปีถัดไป (ใหม่กว่า)"
                            >
                                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous" />
                            </button>

                            {/* กลาง: ช่วงปี (พ.ศ.) ของเพจปัจจุบัน */}
                            <div style={{ textAlign: "center", fontWeight: 400, fontSize: "0.9rem" }}>
                                {toBeYear(yearsList[0])} - {toBeYear(yearsList[yearsList.length - 1])}
                            </div>

                            {/* ปุ่มขวา: ไปยังเพจที่ “เก่ากว่า” (อดีต) */}
                            <button
                                type="button"
                                onClick={handleNextPage}
                                className="react-datepicker__navigation react-datepicker__navigation--next"
                                style={{ position: "static" }}
                                aria-label="ไปยังชุดปีก่อนหน้า (เก่ากว่า)"
                            >
                                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next" />
                            </button>
                        </div>
                    </div>

                    {/* Body: Grid ปี 12 ช่อง */}
                    <div className="react-datepicker__year-container">
                        <div className="react-datepicker__year-wrapper">
                            {yearsList.map((year) => (
                                <div
                                    key={year}
                                    className={getYearClass(year)}
                                    onClick={() => handleYearClick(year)}
                                    role="button"
                                    aria-label={`เลือกปี พ.ศ. ${toBeYear(year)}`}
                                    aria-pressed={selectedYears.some(d => d.getFullYear() === year)}
                                >
                                    {toBeYear(year)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </YearlyDatePickerContainer>
        </YearlyWrapper>
    );
};