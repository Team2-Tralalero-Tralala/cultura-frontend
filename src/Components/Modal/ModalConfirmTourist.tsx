import React from "react";
import Button from "@/Components/Button";

type ModalConfirmProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.4)] font-sarabun fade-in w-screen h-screen top-0 left-0">

      <div className="bg-white rounded-[24px] shadow-2xl w-[450px] p-8 flex flex-col items-center text-center relative animate-scale-up">
        {/* Icon */}
        <div className="mb-4">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" stroke="black" strokeWidth="4"/>
            <path d="M50 28V58" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="50" cy="76" r="4" fill="black"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-lg">{message}</p>

        {/* Buttons */}
        <div className="flex gap-4 w-full justify-center px-4">
          <div className="w-1/2">
            <Button type="cancel" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-1/2">
            <Button type="confirm-tourist" onClick={onConfirm}>
              ยืนยัน
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
