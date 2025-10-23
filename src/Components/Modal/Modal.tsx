/*
 * คำอธิบาย : Component
 * โดยใช้ SweetAlert2 ในการแสดงกล่องข้อความยืนยัน
 * Input :
 *   - open (boolean) : ควบคุมการเปิด/ปิด Modal
 *   - onConfirm (function) : ฟังก์ชันที่จะทำงานเมื่อผู้ใช้กดยืนยัน
 *   - onCancel (function, optional) : ฟังก์ชันที่จะทำงานเมื่อผู้ใช้กดยกเลิก
 *   - title (string, optional) : ข้อความหัวข้อของ Modal
 *   - text (string, optional) : ข้อความอธิบายเพิ่มเติม
 *   - confirmText (string, optional) : ข้อความปุ่มยืนยัน
 *   - cancelText (string, optional) : ข้อความปุ่มยกเลิก
 * Output :
 *   - แสดง SweetAlert popup เพื่อให้ผู้ใช้ยืนยันหรือยกเลิก
 */

import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Icon } from "@iconify/react";

type ModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "TITLE",
  text = "TEXT",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
}) => {
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (!open) return;
    let isFired = false;
    if (!isFired) {
      isFired = true;
      void MySwal.fire({
        iconHtml: (
          <Icon
            icon="circum:circle-alert"
            style={{ fontSize: 150, color: "#004D2C" }}
          />
        ),
        iconColor: "#004D2C",
        title,
        text,
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
          htmlContainer: "text-base",
          actions: "mt-6 flex justify-center gap-4",
          confirmButton:
            "px-6 py-2.5 rounded-lg bg-[#004D2C] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#004D2C]",
          cancelButton:
            "px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400",
          icon: "!border-0 !bg-transparent !shadow-none !w-auto !h-auto p-0",
        },

        didOpen: () => {
          const fontStack = 'var(--font-sarabun), "Sarabun", sans-serif';
          const popup = Swal.getPopup();
          const titleEl = Swal.getTitle();
          const html = Swal.getHtmlContainer();
          const btns = Swal.getActions();
          if (popup) popup.style.fontFamily = fontStack;
          if (titleEl) titleEl.style.fontFamily = fontStack;
          if (html) html.style.fontFamily = fontStack;
          if (btns) btns.style.fontFamily = fontStack;
        },
      }).then((result) => {
        isFired = false;
        if (result.isConfirmed) onConfirm();
        else onCancel?.();
      });
    }

    return () => {
      isFired = true; // block re-run if component unmounts
    };
  }, [open]);

  return null;
};
