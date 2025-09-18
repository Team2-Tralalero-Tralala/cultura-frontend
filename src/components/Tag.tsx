/* 
 * คำอธิบาย: Component Tag สำหรับแสดงข้อความในกล่อง (label ในสไตล์ tag)
 * ใช้ Label component ภายในเพื่อรองรับข้อความและ className
 */
import React from "react";
import Label from "./Label";
import type { LabelProps } from "./Label"; // ⬅️ ใช้ import type

type TagProps = LabelProps;

/* 
 * Function: Tag
 * Input : props { label: string, className?: string }
 * Output : JSX <div> ขนาดคงที่พร้อม Label ข้างใน (ใช้เป็นป้าย/แท็ก)
 */
export const Tag: React.FC<TagProps> = ({ label, className }) => {
    return (
        <div className="w-20 h-9 border-1 border-gray-600 rounded-lg flex items-center justify-center font-medium">
            <Label label={label} className={className} />
        </div>
    );
};
