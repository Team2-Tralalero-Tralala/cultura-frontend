import React from "react";
import { AlertCircle } from "lucide-react";
/* 
 * คำอธิบาย : Component Modal สำหรับยืนยันการทำรายการต่างๆ
 * จะมีปุ่มให้เลือก 2 แบบ คือ ยืนยัน และ ยกเลิก
 * เมื่อเลือกยืนยัน จะทำการยืนยันการทำรายการ
 * เมื่อเลือกยกเลิก จะปิด Modal โดยไม่ทำการยืนยัน
 * Input  : isOpen, title, message, confirmText, cancelText, onConfirm, onCancel
 * Output : หน้า UI สำหรับยืนยันการทำรายการ
 */
interface ModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title = "ยืนยันการทำรายการหรือไม่",
  message = "คุณจะไม่สามารถย้อนกลับได้",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[500px] p-6 text-center">
        {/* ไอคอนแจ้งเตือน */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <AlertCircle size={100} className="text-black" />
          </div>
        </div>

        {/* ข้อความ */}
        <h2 className="text-[32px] font-bold font-sarabun mb-2">
          {title}
        </h2>
        <p className="text-[20px] text-black font-sarabun mb-6">
          {message}
        </p>

        {/* ปุ่ม */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="w-[120px] border border-black text-black py-2 rounded-lg hover:bg-black/10 transition font-sarabun font-semibold text-[18px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-[120px] bg-[#055035] text-white py-2 rounded-lg hover:bg-[#033d29] transition font-sarabun font-semibold text-[18px]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
