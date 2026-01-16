/*
 * คำอธิบาย : โครงสร้างพื้นฐานของ props สำหรับ Component ปุ่ม (Button)
 * ใช้กำหนดข้อความ, สไตล์, ประเภทของปุ่ม, และ event handler เมื่อคลิก
 * Input :
 *   - children : ReactNode (ข้อความหรือตัวประกอบภายในปุ่ม)
 *   - type : ButtonType (ชนิดสไตล์ของปุ่ม เช่น confirm-admin, cancel)
 *   - htmlType : "button" | "submit" | "reset" (ชนิดปุ่มของ HTML)
 *   - onClick : ฟังก์ชัน callback ที่จะถูกเรียกเมื่อคลิกปุ่ม
 * Output :
 *   - ไม่มีการคืนค่า (ใช้ใน JSX เพื่อ render ปุ่ม)
 */

export type ButtonType = "confirm-tourist" | "confirm-admin" | "cancel";

export interface BaseButtonProps {
  children?: React.ReactNode;
  /** ชนิดสไตล์ของปุ่ม */
  type?: ButtonType;
  /** ชนิดปุ่มของ HTML: submit | reset | button */
  htmlType?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
