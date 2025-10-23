/*
 * File : Types/SubmitButton.tsx
 * คำอธิบาย : กำหนด type สำหรับปุ่ม Submit หลักที่ใช้ในหน้าแบบฟอร์ม
 * ใช้ร่วมกับ Component: SubmitButton.tsx
 * จุดเด่น : รองรับขนาด, สถานะโหลด, การปิดใช้งาน, และชนิดปุ่ม HTML
 */

/** ขนาดของปุ่ม */
export type SubmitButtonSize = "sm" | "md" | "lg";

/** สีธีมของปุ่ม (รองรับการขยายในอนาคต เช่น danger, success ฯลฯ) */
export type SubmitButtonVariant = "primary" | "secondary" | "danger";

/** โครงสร้าง props สำหรับปุ่ม Submit */
export interface SubmitButtonProps {
  /** เนื้อหาภายในปุ่ม เช่น "สร้างบัญชี" หรือ "บันทึกข้อมูล" */
  children?: React.ReactNode;

  /** ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่ม */
  onClick?: () => void;

  /** ประเภทของปุ่มใน HTML เช่น submit | button */
  htmlType?: "submit" | "button" | "reset";

  /** ปิดการใช้งานปุ่ม */
  disabled?: boolean;

  /** สถานะโหลด (true = หมุนโหลด, ปิดการคลิก) */
  isLoading?: boolean;

  /** ขนาดปุ่ม เช่น sm = เล็ก, md = ปกติ, lg = ใหญ่ */
  size?: SubmitButtonSize;

  /** ธีมสีของปุ่ม (default = primary) */
  variant?: SubmitButtonVariant;

  /** เพิ่ม className ภายนอก (optional) */
  className?: string;
}
    