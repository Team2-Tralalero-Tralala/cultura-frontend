/*
 * Modal ยืนยันการสร้างวิสาหกิจชุมชน (ไม่มี animation)
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
      // 🔹 ปิด animation ทั้งหมด (ไม่หมุน, ไม่เด้ง)

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
      if (result.isConfirmed) onConfirm();
      else onCancel?.();
    });
  }, [open, MySwal, title, text, confirmText, cancelText, onConfirm, onCancel]);

  return null;
};
