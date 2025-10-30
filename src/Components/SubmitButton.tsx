/*
 * Component: SubmitButton
 * คำอธิบาย: ปุ่ม Submit สำหรับฟอร์ม เช่น "สร้างบัญชี", "บันทึกข้อมูล"
 * ใช้ style อิงจาก Button.tsx (confirm-admin)
 */

// import React from "react";
import type { SubmitButtonProps } from ".././Types/SubmitButton";

function SubmitButton({
  children = "ยืนยัน",
  htmlType = "submit",
  onClick,
  isLoading = false,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        flex items-center justify-center 
        w-full px-3 py-2 border rounded-form 
        text-white text-lg font-medium 
        bg-dark-green hover:bg-green-900 
        transition-all
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? "กำลังบันทึก..." : children}
    </button>
  );
}

export default SubmitButton;
