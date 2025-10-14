/*
 * คำอธิบาย : Component Modal สำหรับแจ้งเตือนเมื่อบัญชีผู้ใช้ถูกระงับการใช้งาน
 * ใช้ SweetAlert2 (พร้อม sweetalert2-react-content) ในการ render popup
 */
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Icon } from "@iconify/react";

type ModalBlockedProps = {
  open: boolean; // true = เปิด modal
  onClose?: () => void; // callback หลังผู้ใช้กดปุ่ม
  title?: string;
  text?: string;
  confirmText?: string;
};
/*
 * คำอธิบาย : Component Modal สำหรับแจ้งเตือนเมื่อบัญชีผู้ใช้ถูกระงับการใช้งาน
 * ใช้ SweetAlert2 (พร้อม sweetalert2-react-content) ในการ render popup
 * Input :
 *   - open (boolean)       : true = แสดง modal, false = ไม่แสดง
 *   - onClose? (function)  : callback หลัง modal ถูกปิด
 *   - title? (string)      : ข้อความหัวข้อ modal (default: "บัญชีของคุณถูกระงับการใช้งาน")
 *   - text? (string)       : ข้อความอธิบายใน modal
 *   - confirmText? (string): ข้อความปุ่มยืนยัน (default: "ตกลง")
 * Output :
 *   - แสดง popup แจ้งเตือนพร้อม icon, title, text และปุ่ม confirm
 *   - เมื่อผู้ใช้กดปุ่ม → เรียก onClose()
 */
const ModalBlocked: React.FC<ModalBlockedProps> = ({
  open,
  onClose,
  title = "บัญชีของคุณถูกระงับการใช้งาน",
  text = "บัญชีนี้ถูกระงับการใช้งาน จึงไม่สามารถเข้าสู่ระบบได้",
  confirmText = "ตกลง",
}) => {
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (!open) return;

    void MySwal.fire({
      // ใช้ icon container ของ SweetAlert2 เพื่อให้วาง React node ได้
      icon: "info",
      iconHtml: <Icon icon="ri:user-forbid-line" style={{ fontSize: 116 }} />,
      iconColor: "#FFE254",

      title,
      text,

      // ขยายขนาด popup
      width: 560,
      padding: "1.75rem",

      // ปิดสไตล์ปุ่มเริ่มต้นของ Swal เพื่อให้ Tailwind มีผลเต็มที่
      buttonsStyling: false,
      showConfirmButton: true,
      confirmButtonText: confirmText,

      // ป้องกันปิดโดยคลิกนอกจอ/กด ESC (ปรับได้ตามต้องการ)
      allowOutsideClick: false,
      allowEscapeKey: true,

      customClass: {
        popup: "rounded-2xl",
        title: "text-2xl font-bold leading-tight",
        htmlContainer: "text-base",
        actions: "mt-6",
        confirmButton:
          "px-6 py-2.5 rounded-lg bg-[#002F1A] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#002F1A]",
        // เอาเส้นขอบ/เงา/ขนาด icon container ออก ให้ใช้ขนาดของ icon เอง
        icon: "!border-0 !bg-transparent !shadow-none !w-auto !h-auto p-0",
      },

      didOpen: () => {
        // ตั้งฟอนต์ทั้ง popup (รวม title / content / ปุ่ม)
        const fontStack = 'var(--font-sarabun), "Sarabun",  sans-serif';

        const popup = Swal.getPopup();
        const titleEl = Swal.getTitle();
        const html = Swal.getHtmlContainer();
        const btn = Swal.getConfirmButton();

        if (popup) popup.style.fontFamily = fontStack;
        if (titleEl) titleEl.style.fontFamily = fontStack;
        if (html) html.style.fontFamily = fontStack;
        if (btn) btn.style.fontFamily = fontStack;
      },
    }).then(() => {
      onClose?.();
    });
  }, [open, MySwal, title, text, confirmText, onClose]);

  // ไม่ต้องเรนเดอร์อะไรใน DOM
  return null;
};

export default ModalBlocked;
