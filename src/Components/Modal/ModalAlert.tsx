/*
 * คำอธิบาย :
 * Component ModalAlert ใช้ SweetAlert2 แสดงข้อความแจ้งเตือน
 */
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Icon } from "@iconify/react";

interface ModalAlertProps {
  isOpen: boolean;
  type?: "success" | "error" | "info" | "warning";
  title?: string;
  message?: string;
  onClose: () => void;
}

/*
 * คำอธิบาย :
 * Component ModalAlert ใช้ SweetAlert2 แสดงข้อความแจ้งเตือน
 * Input :
 *   - isOpen (boolean) : ควบคุมการเปิด/ปิด Modal
 *   - type (string, optional) : ประเภทของ Modal
 *   - title (string, optional) : ข้อความหัวข้อของ Modal
 *   - message (string, optional) : ข้อความอธิบายเพิ่มเติม
 *   - onClose (function) : ฟังก์ชันที่จะทำงานเมื่อผู้ใช้กดปิด Modal
 * Output :
 *   - แสดง SweetAlert popup เพื่อให้ผู้ใช้ยืนยันหรือยกเลิก
 */
export const ModalAlert: React.FC<ModalAlertProps> = ({
  isOpen,
  type = "info",
  title = "Alert",
  message = "",
  onClose,
}) => {
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (!isOpen) return;

    void MySwal.fire({
      iconHtml: (
        <Icon
          icon={
            type === "success"
              ? "solar:check-circle-bold-duotone"
              : type === "error"
                ? "solar:close-circle-bold-duotone"
                : type === "warning"
                  ? "solar:warning-circle-bold-duotone"
                  : "solar:info-circle-bold-duotone"
          }
          width={160}
          height={160}
          style={{
            color:
              type === "success"
                ? "#004D2C"
                : type === "error"
                  ? "#D92D20"
                  : type === "warning"
                    ? "#E9A100"
                    : "#004D2C",
          }}
        />
      ),
      title,
      text: message,
      confirmButtonText: "ปิด",
      width: 612,
      color: "#0f172a",
      padding: "1.5rem",
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
        icon: "!border-0 !bg-transparent !shadow-none !w-auto !h-auto p-0",
      },

      didOpen: () => {
        const popup = Swal.getPopup();
        const titleEl = Swal.getTitle();
        const html = Swal.getHtmlContainer();
        const buttons = Swal.getActions();
        const icon = Swal.getIcon();

        const fontStack = 'var(--font-sarabun), "Sarabun", sans-serif';
        if (popup) popup.style.fontFamily = fontStack;
        if (titleEl) titleEl.style.fontFamily = fontStack;
        if (html) html.style.fontFamily = fontStack;
        if (buttons) buttons.style.fontFamily = fontStack;

        if (popup) {
          popup.style.display = "grid";
          popup.style.gridTemplateRows = "160px 50px 48px 42px";
          popup.style.borderRadius = "32px";
        }
        if (icon) {
          icon.style.height = "150px";
          icon.style.background = "transparent";
          icon.style.boxShadow = "none";
        }
      },
    }).then(() => {
      onClose();
    });
  }, [isOpen, type, title, message, onClose]);

  return null;
};
