/*
 * คำอธิบาย : Component Modal Tag สำหรับการเพิ่มหรือแก้ไข "ประเภทกิจกรรม" ด้วย Modal Popup
 */

import React, { useEffect, useState } from 'react';
import { Button } from "@/Components/ui/button";

interface ModalTagProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  initialValue?: string;
  existingTags?: string[];
  errorMessage?: string;
}

const ModalTag: React.FC<ModalTagProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = '',
  existingTags = [],
  errorMessage,
}) => {
  const [tagName, setTagName] = useState(initialValue);
  const [localError, setLocalError] = useState('');   

  /*
   * คำอธิบาย : สำหรับตั้งค่าเริ่มต้นเมื่อ modal ถูกเปิด
   */
  useEffect(() => {
    setTagName(initialValue);
    setLocalError('');
  }, [initialValue, isOpen]);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการเมื่อผู้ใช้กดปุ่มยืนยัน ตรวจสอบความถูกต้องของข้อมูล เรียกฟังก์ชัน onConfirm พร้อมส่งค่าชื่อประเภทกลับไป
   */
  const handleSubmit = () => {
    const trimmedName = tagName.trim();

    if (!trimmedName) {
      setLocalError('กรุณากรอกชื่อประเภท');
      return;
    }

    /*
     * คำอธิบาย : สำหรับตรวจสอบว่าชื่อประเภทที่กรอกซ้ำกับที่มีอยู่แล้วหรือไม่
     */
    const isDuplicate = existingTags
      .filter((tag) => tag !== initialValue)
      .some((tag) => tag.toLowerCase() === trimmedName.toLowerCase());

    if (isDuplicate) {
      setLocalError('ชื่อซ้ำกับที่มีอยู่แล้ว');
      return;
    }

    onConfirm(trimmedName);
    setTagName('');
    setLocalError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[591px] h-[277px] shadow-lg flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold">
          {initialValue ? 'การแก้ไขประเภท' : 'การเพิ่มประเภท'}
        </h2>

        <div className="flex flex-col items-end w-[518px]">
          {/* แสดงข้อความ error ทั้งจากภายในและจาก parent */}
          {(localError || errorMessage) && (
            <p className="text-red-500 text-sm mb-1">
              {localError || errorMessage}
            </p>
          )}

          {/* ช่อง input สำหรับกรอกชื่อประเภท */}
          <input
            type="text"
            placeholder="กรอกชื่อประเภท"
            value={tagName}
            onChange={(event) => {
              setTagName(event.target.value);
              setLocalError('');
            }}
            className={`px-3 w-full h-[50px] rounded-[8px] transition-colors duration-200 ${localError || errorMessage
              ? 'border-red-500 border-[1.5px]'
              : 'border-black border-[1px]'
            }`}
          />
        </div>

        {/* ปุ่มยกเลิกและยืนยัน */}
        <div className="flex justify-center gap-4 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-[100px] border-black text-black hover:bg-gray-50"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-[100px] bg-[#055035] hover:bg-[#3a6657] text-white"
          >
            {initialValue ? 'บันทึก' : 'สร้าง'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalTag;
