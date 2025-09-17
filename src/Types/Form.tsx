/*
 * คำอธิบาย : Type สำหรับกำหนด props ของ Component TextField
 * ใช้ควบคุม input field ทั่วไป เช่น username, email, password, phone
 * Input :
 *   - id (string)              : ค่าที่ไม่ซ้ำ ใช้เป็น key และ attribute ของ input
 *   - label (string)           : ชื่อ label ของ input
 *   - required? (boolean)      : true = ต้องกรอก (optional, default = false)
 *   - placeholder? (string)    : ข้อความแสดงใน input เมื่อยังไม่ได้กรอก
 *   - type? (string)           : ประเภท input เช่น "text", "password", "email" (default = "text")
 *   - value? (string)          : ค่าที่ใส่ลงไปใน input
 *   - onChange? (function)     : callback เมื่อค่าใน input เปลี่ยน
 *   - error? (boolean)         : ใช้ระบุว่ามี error เกี่ยวกับ input หรือไม่
 *   - helperText? (string)     : ข้อความช่วยเหลือหรือ error message ใต้ input
 * Output :
 *   - props สำหรับส่งเข้าไปควบคุมการทำงานของ TextField Component
 */

export type TextFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
};
