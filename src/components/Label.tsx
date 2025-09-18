/* 
 * คำอธิบาย: Component Label สำหรับแสดงข้อความ (Text Label)
 * สามารถรับ className เพิ่มเติมเพื่อปรับแต่งสไตล์ได้
 */
import React from "react";

/* 
 * Function: Label
 * Input : props { label: string, className?: string }
 * Output : JSX <div> สำหรับแสดงข้อความ
 */
export type LabelProps = {   
    label: string;
    className?: string;
};

const Label: React.FC<LabelProps> = ({ label, className }) => {
    return <div className={className}>{label}</div>;
};

export default Label;
