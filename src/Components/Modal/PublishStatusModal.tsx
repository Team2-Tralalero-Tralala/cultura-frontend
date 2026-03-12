/**
 * คำอธิบาย : Component สำหรับแสดง Modal ให้ผู้ดูแลระบบเลือกสถานะการเผยแพร่แพ็กเกจ
 * ว่าจะเผยแพร่ทันที (APPROVE) หรือส่งให้ผู้ดูแลระบบตรวจสอบ (PENDING_SUPER)
 */

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Button from "../Button";

interface PublishStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: "APPROVE" | "PENDING_SUPER") => void;
  isSaving?: boolean;
}

/**
 * ฟังก์ชัน : PublishStatusModal
 * คำอธิบาย : คอมโพเนนต์ Modal สำหรับจัดการสถานะการอนุมัติก่อนบันทึกแพ็กเกจ
 * Input : PublishStatusModalProps (isOpen, onClose, onConfirm, isSaving)
 * Output : JSX element สำหรับแสดงหน้าต่างเลือกสถานะ
 */
export const PublishStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}: PublishStatusModalProps) => {
  // ตั้งชื่อตัวแปรตามมาตรฐาน camelCase และสื่อความหมายว่าเป็นข้อมูลสถานะที่เลือก
  const [selectedStatus, setSelectedStatus] = useState<"APPROVE" | "PENDING_SUPER">("APPROVE");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[468px] rounded-[20px] bg-white p-8 shadow-lg">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[18px] font-bold text-center w-full">
            เลือกสถานะการเผยแพร่
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mingcute:close-line" width="24" />
          </button>
        </div>

        {/* Options Section */}
        <div className="flex flex-col gap-6 mb-10">
          {/* ตัวเลือกส่งตรวจสอบ (PENDING_SUPER) */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="radio"
              className="hidden"
              checked={selectedStatus === "PENDING_SUPER"}
              onChange={() => setSelectedStatus("PENDING_SUPER")}
            />
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                selectedStatus === "PENDING_SUPER" ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {selectedStatus === "PENDING_SUPER" && (
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </div>
            <span className="text-[16px] text-black">ส่งให้ผู้ดูแลระบบตรวจสอบ</span>
          </label>

          {/* ตัวเลือกเผยแพร่ทันที (APPROVE) */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="radio"
              className="hidden"
              checked={selectedStatus === "APPROVE"}
              onChange={() => setSelectedStatus("APPROVE")}
            />
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                selectedStatus === "APPROVE" ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {selectedStatus === "APPROVE" && (
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </div>
            <span className="text-[16px] text-black">เผยแพร่แพ็กเกจนี้</span>
          </label>
        </div>

        {/* Action Button Section */}
        <div className="flex justify-end">
          <div className="w-[120px]">
            <Button
              type="confirm-admin"
              onClick={() => onConfirm(selectedStatus)}
              isDisabled={isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "ยืนยัน"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishStatusModal;
