/*
 * คำอธิบาย : Component สำหรับสร้างปุ่มยืนยัน (Submit) ใช้งานในระบบ
 * โดยอิงโครงสร้างเดียวกับ Button Component (type = confirm-admin, confirm-tourist, cancel)
 * เพิ่มคุณสมบัติ isLoading สำหรับแสดงสถานะกำลังบันทึกข้อมูล
 */

import type { BaseButtonProps } from "@/Types/Button";

/*
 * ฟังก์ชัน : SubmitButton
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์ปุ่มยืนยัน
 * Input : BaseButtonProps + isLoading (สถานะโหลด)
 * Output : <button> element ที่มีสไตล์ตรงตามประเภทปุ่ม
 */

interface SubmitButtonProps extends BaseButtonProps {
  /** สถานะโหลด (true = หมุนโหลด, ปิดการคลิก) */
  isLoading?: boolean;
}

function SubmitButton({
  children,
  type = "confirm-admin",
  htmlType = "submit",
  onClick,
  isLoading = false,
}: SubmitButtonProps) {
  const isCancel = type === "cancel";

  /*
   * ฟังก์ชัน : getBgColor
   * คำอธิบาย : ฟังก์ชันกำหนดสีพื้นหลังของปุ่มตามประเภท
   * Input : type
   * Output : className สีพื้นหลังของปุ่ม
   */
  function getBgColor() {
    switch (type) {
      case "cancel":
        return "bg-white hover:bg-gray-100 border-black text-black";
      case "confirm-tourist":
        return "bg-light-green hover:bg-emerald-500 text-white";
      case "confirm-admin":
      default:
        return "bg-dark-green hover:bg-green-900 text-white";
    }
  }

  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center w-full px-3 py-2 border rounded-form text-lg font-semibold ${getBgColor()} ${
        isLoading ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* แสดงสถานะโหลด */}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 000 16v-4l-4 4 4 4v-4a8 8 0 01-8-8z"
            />
          </svg>
          กำลังบันทึก...
        </span>
      ) : (
        children || (isCancel ? "Cancel" : "Submit")
      )}
    </button>
  );
}

export default SubmitButton;
