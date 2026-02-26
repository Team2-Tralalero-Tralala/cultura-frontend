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
/**
 * คำอธิบาย: Component สำหรับสร้าง TextField (อินพุตฟอร์ม)
 * รองรับ text, password (พร้อม toggle), และเบอร์โทรศัพท์ (+66)
 * Input:
 *   - id: string
 *   - label: string
 *   - required: boolean
 *   - placeholder: string
 *   - type: string (text, password, tel)
 *   - value: string
 *   - name: string
 *   - readOnly: boolean
 *   - onChange: function
 *   - error: boolean
 *   - helperText: string
 * Output: JSX Element ของ Input Field
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
  const [isShowPassword, setIsShowPassword] = useState(false);

  const currentType = isPassword ? (isShowPassword ? "text" : "password") : type;

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
            className={`block w-full rounded-form border
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
            onClick={() => setIsShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={isShowPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={isShowPassword}
            title={isShowPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            <EyeIcon hidden={!isShowPassword} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TextField;
