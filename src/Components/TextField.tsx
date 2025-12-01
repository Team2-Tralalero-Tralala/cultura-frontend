/*
 * คำอธิบาย : Component สำหรับสร้าง TextField (อินพุตฟอร์ม)
 * รองรับ text, password (พร้อม toggle), และเบอร์โทรศัพท์ (+66)
 */

import React, { useState } from "react";
import type { BaseFieldProps } from "@/Types/BaseField";
import { Icon } from "@iconify/react";

/* ---------- Required mark ---------- */
function RequiredMark() {
  return <span className="text-red-600"> *</span>;
}

/* ---------- Eye icon for password toggle ---------- */
function EyeIcon({ hidden }: { hidden: boolean }) {
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
 * Output : React component <BaseFieldProps> สำหรับใช้งานเป็น input ในฟอร์ม
 */
const TextField: React.FC<BaseFieldProps> = ({
  id,
  label,
  required,
  placeholder,
  type = "text",
  value,
  name,
  readOnly,
  onChange,
  error = false,
  helperText = "",
}) => {
  const isPassword = type === "password";
  const isTel = type === "tel";
  const [showPassword, setShowPassword] = useState(false);

  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {/* Label + helperText */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-base font-semibold text-black">
          {label}
          {required && <RequiredMark />}
        </label>
        <span
          id={`${id}-helper-text`}
          className={`text-xs ml-2 min-h-[18px] transition-all ${
            error ? "text-red-600 visible" : "text-gray-500"
          }`}
        >
          {helperText}
        </span>
      </div>

      {/* Input */}
      <div className="relative">
        {/* ---------- Text / Password ---------- */}
        {!isTel && (
          <input
            id={id}
            name={name}
            type={currentType}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            readOnly={readOnly}
            className={`block w-full rounded-form border-1
            ${
              error
                ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                : "border-gray-400 focus:ring-gray-400 focus:border-gray-500"
            }
            bg-white px-5 py-2 text-black placeholder:text-[#606060] placeholder:font-normal leading-relaxed
            focus:outline-none focus:ring-1 transition-shadow ${isPassword ? "pr-12" : ""}`}
          />
        )}

        {/* ---------- Telephone ---------- */}
        {isTel && (
          <div
            className={`flex items-center rounded-form border overflow-hidden ${
              error
                ? "border-red-600 focus-within:ring-red-600 focus-within:border-red-600"
                : "border-gray-400 focus-within:ring-gray-400 focus-within:border-gray-500"
            }`}
          >
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
              className="block w-full px-5 py-2 text-base text-black placeholder:text-[#606060] placeholder:font-normal
                leading-relaxed focus:outline-none focus:ring-1 transition-shadow"
            />
          </div>
        )}

        {/* ---------- Password toggle ---------- */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
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
