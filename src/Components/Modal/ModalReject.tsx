/**
 * คำอธิบาย: Modal ปฏิเสธคำขอ (SweetAlert2)
 * แสดง textarea ให้กรอกเหตุผล จำกัดความยาวตาม DTO มีปุ่มยืนยัน/ยกเลิก
 */

import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Icon } from "@iconify/react";

/** โครงสร้าง props สำหรับ ModalReject */
type ModalRejectProps = {
  /** ควบคุมการเปิด/ปิดโมดัล */
  isOpen: boolean;
  /** หัวข้อ */
  title?: string;
  /** ข้อความอธิบาย */
  text?: string;
  /** ข้อความปุ่มยืนยัน */
  confirmText?: string;
  /** ข้อความปุ่มยกเลิก */
  cancelText?: string;
  /** ค่าเริ่มต้นของเหตุผล */
  defaultReason?: string;
  /** callback เมื่อยืนยัน พร้อมเหตุผล */
  onConfirm: (reason: string) => void;
  /** callback เมื่อยกเลิก/ปิด */
  onCancel?: () => void;
  /** ความยาวสูงสุดของเหตุผล (ตาม DTO), ดีฟอลต์ 100 */
  maxLength?: number;
};

const ModalReject: React.FC<ModalRejectProps> = (props) => {
  const {
    isOpen,
    onConfirm,
    onCancel,
    title = "ปฏิเสธคำขออนุมัติ",
    text = "กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ",
    confirmText = "ส่ง",
    cancelText = "ยกเลิก",
    defaultReason = "",
    maxLength = 100,
  } = props;

  const MySwal = withReactContent(Swal);

  // กัน SweetAlert ถูกยิงซ้ำ (เช่นกรณี React.StrictMode)
  const shownRef = useRef(false);

  useEffect(() => {
    if (!isOpen || shownRef.current) return;
    shownRef.current = true;

    void MySwal.fire({
            iconHtml: (
                <Icon icon="circum:circle-alert" style={{ fontSize: 120, color: "#004D2C" }} />
            ),
      iconColor: "#004D2C",
      title,
      html: (
        <div className="text-center">
          <p className="leading-relaxed">{text}</p>
        </div>
      ),
      input: "textarea",
      inputValue: defaultReason,
      inputPlaceholder: "ระบุเหตุผลที่ปฏิเสธ...",
      inputAttributes: {
        "aria-label": "เหตุผลการปฏิเสธ",
        // จำกัดความยาวตาม DTO
        maxlength: String(maxLength),
      },
      // ตรวจสอบตาม DTO: ไม่ว่าง และไม่เกิน maxLength
      inputValidator: (value?: string) => {
        const v = (value ?? "").trim();
        if (!v) return "กรุณากรอกเหตุผล";
        if (v.length > maxLength) return `เหตุผลต้องไม่เกิน ${maxLength} อักขระ`;
        return undefined;
      },

      width: 560,
      padding: "1.75rem",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: true,
      reverseButtons: true,

      customClass: {
        popup: "rounded-2xl",
        title: "text-2xl font-bold leading-tight",
        htmlContainer: "text-base text-center mb-2",
        actions: "mt-4 flex justify-center gap-4",
        confirmButton:
          "px-6 py-2.5 rounded-lg bg-[#004D2C] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#004D2C]",
        cancelButton:
          "px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400",
        icon: "!border-0 !bg-transparent !shadow-none !w-auto !h-auto p-0",
        input:
          "swal2-textarea !block !mx-auto !w-[480px] max-w-full !h-32 !rounded-lg !border !border-gray-300 !p-3 !text-base",
      },

      didOpen: () => {
        const fontStack = 'var(--font-sarabun), "Sarabun", sans-serif';
        const popup = Swal.getPopup();
        const titleEl = Swal.getTitle();
        const html = Swal.getHtmlContainer();
        const btns = Swal.getActions();
        const inputEl = Swal.getInput();

        if (popup) popup.style.fontFamily = fontStack;
        if (titleEl) titleEl.style.fontFamily = fontStack;
        if (html) html.style.fontFamily = fontStack;
        if (btns) btns.style.fontFamily = fontStack;

        if (inputEl instanceof HTMLTextAreaElement || inputEl instanceof HTMLInputElement) {
          inputEl.style.fontFamily = fontStack;
        }
      },

      // ตัดช่องว่างหัว-ท้ายก่อนคืนค่า
      preConfirm: (reason) => ((reason as string) ?? "").trim(),
    }).then((res) => {
      shownRef.current = false;
      if (res.isConfirmed) onConfirm((res.value as string) ?? "");
      else onCancel?.();
    });
  }, [isOpen]); // รันเฉพาะตอน isOpen เปลี่ยน

  return null;
};

export default ModalReject;
