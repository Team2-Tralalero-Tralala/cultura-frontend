/*
 * คำอธิบาย : Component สำหรับสร้างปุ่มใช้งานในระบบ
 * โดยรองรับหลายประเภท เช่น Confirm สำหรับ Tourist, Confirm สำหรับ Admin และ Cancel
 */

import { ButtonType, type BaseButtonProps } from "@/Types/Button";

/*
 * ฟังก์ชัน : Button
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์ปุ่ม โดยจะเปลี่ยนสีพื้นหลังและสไตล์ตาม type
 * Input : BaseButtonProps (children, type, htmlType, onClick)
 * Output : <button> element ที่มีสไตล์ตรงตามประเภทปุ่ม
 */

function Button({
  children,
  type = ButtonType.ConfirmTourist,
  htmlType = "button",
  onClick,
}: BaseButtonProps) {
  const isCancel = type == "cancel";

  /*
   * ฟังก์ชัน : getBgColor
   * คำอธิบาย : ฟังก์ชันสำหรับกำหนดสีพื้นหลัง โดยจะเปลี่ยนสีพื้นหลังและสไตล์ตาม type
   * Input : type
   * Output : สีปุ่มตาม type
   */
  function getBgColor() {
    switch (type) {
      case ButtonType.Cancel:
        return "bg-white hover:bg-gray-100";
      case ButtonType.ConfirmTourist:
        return "bg-light-green hover:bg-emerald-500";
      case ButtonType.ConfirmAdmin:
      default:
        return "bg-dark-green hover:bg-green-900";
    }
  }

  return (
    <>
      {/* ปุ่มฝั่ง confirm */}
      {!isCancel && (
        <button
          type={htmlType}
          onClick={onClick}
          className={`flex items-center justify-center w-full px-3 py-2 border rounded-form text-white text-lg ${getBgColor()}`}
        >
          {children || "ConfirmAdmin"}
        </button>
      )}
      {/* ปุ่มฝั่ง cancel */}
      {isCancel && (
        <button
          type={htmlType}
          onClick={onClick}
          className={`flex items-center justify-center w-full px-3 py-2 border rounded-form  border-black text-black text-lg ${getBgColor()}`}
        >
          {children || "Cancel"}
        </button>
      )}
    </>
  );
}

export default Button;
