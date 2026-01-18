/*
 * คำอธิบาย : Component สำหรับสร้างปุ่มใช้งานในระบบ
 * โดยรองรับหลายประเภท เช่น Confirm สำหรับ Tourist, Confirm สำหรับ Admin และ Cancel
 */

import type { BaseButtonProps } from "@/Types/Button";

/*
 * ฟังก์ชัน : Button
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์ปุ่ม โดยจะเปลี่ยนสีพื้นหลังและสไตล์ตาม type
 * Input : BaseButtonProps (children, type, htmlType, onClick)
 * Output : <button> element ที่มีสไตล์ตรงตามประเภทปุ่ม
 */

function Button({
  children,
  type = "confirm-admin",
  htmlType = "button",
  onClick,
  className,
  disabled,
}: BaseButtonProps) {
  const isCancel = type == "cancel";

  /*
   * ฟังก์ชัน : getBgColor
   * คำอธิบาย : ฟังก์ชันสำหรับกำหนดสีพื้นหลัง โดยจะเปลี่ยนสีพื้นหลังและสไตล์ตาม type
   * Input : type
   * Output : สีปุ่มตาม type
   */
  function getBgColor() {
    if (disabled) return "bg-gray-400 cursor-not-allowed";
    switch (type) {
      case "cancel":
        return "bg-white hover:bg-gray-100";
      case "confirm-tourist":
        return "bg-light-green hover:bg-emerald-500";
      case "confirm-admin":
      default:
        return "bg-[#055035] hover:bg-green-900";
    }
  }

  return (
    <>
      {/* ปุ่มฝั่ง confirm */}
      {!isCancel && (
        <button
          type={htmlType}
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center w-full px-3 py-2 border rounded-form text-white text-base ${getBgColor()} ${
            className || ""
          }`}
        >
          {children || "ConfirmAdmin"}
        </button>
      )}
      {/* ปุ่มฝั่ง cancel */}
      {isCancel && (
        <button
          type={htmlType}
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center w-full px-3 py-2 border rounded-form  border-black text-black text-base ${getBgColor()} ${
            className || ""
          }`}
        >
          {children || "Cancel"}
        </button>
      )}
    </>
  );
}

export default Button;
