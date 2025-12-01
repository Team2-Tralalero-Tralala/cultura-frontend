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

const sweetAlert = withReactContent(Swal);

export const Modal: React.FC<ModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "TITLE",
  text = "TEXT",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
}) => {
  useEffect(() => {
    if (!open) return;

    let isFired = false;
    if (!isFired) {
      isFired = true;

      void sweetAlert
        .fire({
          iconHtml: (
            <Icon icon="circum:circle-alert" width={164} height={164} style={{ color: "#000" }} />
          ),
          iconColor: "#004D2C",
          title,
          text,
          width: 612,
          color: "#0f172a",
          padding: "1.5rem",
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: confirmText,
          cancelButtonText: cancelText,
          buttonsStyling: false,
          allowOutsideClick: false,
          allowEscapeKey: true,
          reverseButtons: true,
          heightAuto: false,

          customClass: {
            popup: "rounded-[32px] h-[380px] px-8 py-6",
            title: "text-3xl font-semibold text-gray-800 mt-2 mb-2",
            htmlContainer: "text-lg text-gray-600 mb-6",
            actions: "mt-4 flex justify-center gap-4",
            confirmButton:
              "w-[120px] py-2.5 text-lg rounded-lg bg-[#004D2C] text-white hover:bg-[#003c22] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#004D2C]",
            cancelButton:
              "w-[120px] py-2.5 text-lg rounded-lg border border-[#000000] bg-white text-[#000000] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#004D2C]",
            icon: "!border-0 !bg-transparent !shadow-none !w-auto !h-auto p-0",
          },

          didOpen: () => {
            const fontStack = 'var(--font-sarabun), "Sarabun", sans-serif';

            const popupEl = Swal.getPopup();
            const titleEl = Swal.getTitle();
            const htmlContainerEl = Swal.getHtmlContainer();
            const actionsEl = Swal.getActions();

            if (popupEl) popupEl.style.fontFamily = fontStack;
            if (titleEl) titleEl.style.fontFamily = fontStack;
            if (htmlContainerEl) htmlContainerEl.style.fontFamily = fontStack;
            if (actionsEl) actionsEl.style.fontFamily = fontStack;

            // จัดเลย์เอาต์ popup + ปรับขนาดไอคอน
            const iconEl = Swal.getIcon();
            if (popupEl) {
              popupEl.style.display = "grid";
              popupEl.style.gridTemplateRows = "160px 50px 48px 42px";
              popupEl.style.fontFamily = fontStack;
              popupEl.style.borderRadius = "20px";
            }
            if (iconEl) {
              iconEl.style.height = "150px";
              iconEl.style.background = "transparent";
              iconEl.style.boxShadow = "none";
            }
          },
        })
        .then((result) => {
          isFired = false;
          if (result.isConfirmed) onConfirm();
          else onCancel?.();
        });
    }

    return () => {
      isFired = true; // กัน re-run ตอน unmount
    };
  }, [open, onConfirm, onCancel, sweetAlert]);

  return null;
};
