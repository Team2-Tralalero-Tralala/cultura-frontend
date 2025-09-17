/*
 * คำอธิบาย : Component สำหรับสร้าง TextField (อินพุตฟอร์ม)
 * ที่รองรับหลายประเภท เช่น ข้อความทั่วไป, รหัสผ่าน (พร้อมปุ่ม toggle แสดง/ซ่อน),
 * และเบอร์โทรศัพท์ (พร้อม prefix +66 และไอคอนธงไทย)
 */
import React, { useState } from "react";
import type { TextFieldProps } from "@/Types/Form";
import { Icon } from "@iconify/react";

/*
 * ฟังก์ชัน : RequiredMark
 * คำอธิบาย : แสดงเครื่องหมาย * สีแดง เมื่อฟิลด์เป็น required
 * Input : -
 * Output : React element <span>
 */

function RequiredMark() {
  return <span className="text-red-600"> *</span>;
}

/*
 * ฟังก์ชัน : EyeIcon
 * คำอธิบาย : แสดงไอคอนตา (eye / eye-off) สำหรับ toggle password
 * Input : hidden (boolean) - ถ้า true แสดงไอคอน eye-off, ถ้า false แสดง eye
 * Output : React element <Icon>
 */

function EyeIcon({ hidden }: { hidden: boolean }) {
  // ถ้า hidden = true แปลว่า "กำลังซ่อน" => แสดงไอคอนมีเส้นพาด (eye-off)
  return hidden ? (
    <Icon icon="mdi:eye-off-outline" style={{ fontSize: "24px" }} />
  ) : (
    <Icon icon="mdi:eye-outline" style={{ fontSize: "24px" }} />
  );
}
/*
 * ฟังก์ชัน : TextField
 * คำอธิบาย : Component หลักสำหรับ input ฟอร์ม รองรับ text, password, และ tel
 * Input :
 *   - id (string) : id ของ input element
 *   - label (string) : label ที่แสดงด้านบนของ input
 *   - required (boolean) : แสดงเครื่องหมาย * ถ้าเป็นฟิลด์บังคับ
 *   - placeholder (string) : ข้อความ placeholder ใน input
 *   - type (string) : ประเภท input เช่น "text", "password", "tel"
 *   - value (string) : ค่าปัจจุบันของ input
 *   - onChange (function) : callback เมื่อค่ามีการเปลี่ยนแปลง
 *   - error (boolean) : สถานะ error
 *   - helperText (string) : ข้อความแสดง error หรือคำแนะนำ
 * Output : React component <TextField> สำหรับใช้งานเป็น input ในฟอร์ม
 */
const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  required,
  placeholder,
  type = "text",
  value,
  onChange,
  error = false,
  helperText = "",
}) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const isTel = type === "tel";

  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {/* Label + helperText in one row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-base font-semibold text-gray-800"
        >
          {label}
          {required && <RequiredMark />}
        </label>
        {/* helperText on the right */}
        <span
          id={`${id}-helper-text`}
          className={`text-xs ml-2 min-h-[18px] transition-all ${
            error ? "text-red-600 visible" : "text-gray-500"
          }`}
        >
          {helperText}
        </span>
      </div>

      <div className="relative">
        {!isTel && (
          <input
            id={id}
            type={currentType}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            className={`block w-full rounded-form border-1 
            ${
              error
                ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                : "border-gray-400 focus:ring-gray-400 focus:border-gray-500"
            }
            bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed placeholder:leading-relaxed
            focus:outline-none focus:ring-1 transition-shadow ${
              isPassword ? "pr-12" : ""
            }`}
          />
        )}

        {isTel && (
          <div
            className={`flex items-center rounded-form border-1 overflow-hidden 
            ${
              error
                ? "border-red-600 focus-within:ring-red-600 focus-within:border-red-600"
                : "border-gray-400 focus-within:ring-gray-400 focus-within:border-gray-500"
            }`}
          >
            {/* flag +66 */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 border-r">
              <Icon icon="twemoji:flag-thailand" style={{ fontSize: "24px" }} />
              <span className="text-gray-700 font-medium">+66</span>
            </div>
            <input
              id={id}
              type="tel"
              onChange={onChange}
              value={value}
              placeholder={placeholder || "หมายเลขโทรศัพท์"}
              className="block w-full px-5 py-2 text-base text-gray-900 placeholder:text-gray-500
                leading-relaxed placeholder:leading-relaxed
                focus:outline-none focus:ring-1 transition-shadow"
            />
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2  ${
              error ? "focus:red-600" : "focus:ring-gray-400"
            }`}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
            title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            <EyeIcon hidden={!showPassword} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TextField;
