/* 
 * คำอธิบาย: Component Tag สำหรับแสดงข้อความในกล่อง (label ในสไตล์ tag)
 * ใช้ Label component ภายในเพื่อรองรับข้อความและ className
 */
import React from "react";

type TagProps = {
    label: string;
    className?: string;
};

/* 
 * Function: Tag
 * Output : JSX <div> ขนาดคงที่พร้อม Label ข้างใน (ใช้เป็นป้าย/แท็ก)
 */
export const Tag: React.FC<TagProps> = ({ label, className }) => {
    return (
        <div className={`w-20 h-9 border border-gray-600 rounded-lg flex items-center justify-center font-medium ${className ?? ""}`}>
            {label}
        </div>
    );
};
