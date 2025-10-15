// src/Components/Button.tsx
import React from "react";

type ButtonProps = {
  type?: string;                    // สำหรับสไตล์ เช่น confirm-admin
  htmlType?: "button" | "submit" | "reset";   // ✅ เพิ่มตรงนี้
  className?: string;               // ✅ เผื่อไว้สำหรับ tailwind เพิ่มคลาส
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({
  type = "default",
  htmlType = "button",
  className = "",
  children,
  onClick,
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-semibold transition-colors";
  const variant =
    type === "confirm-admin"
      ? "bg-green-700 text-white hover:bg-green-800"
      : "bg-gray-200 hover:bg-gray-300";

  return (
    <button
      type={htmlType}
      onClick={onClick}
      className={`${base} ${variant} ${className}`} // ✅ รวมคลาส
    >
      {children}
    </button>
  );
}
