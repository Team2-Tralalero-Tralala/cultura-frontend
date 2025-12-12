/*
 * คำอธิบาย : Component Modal สำหรับการเพิ่มหรือแก้ไข "ประเภทกิจกรรม"
 * หน้าที่ :
 *   - แสดง Modal UI สำหรับกรอกชื่อประเภท
 *   - ตรวจสอบชื่อที่กรอกว่าซ้ำกับประเภทที่มีอยู่หรือไม่
 *   - แสดง error ทั้งจาก validation ภายในและ error จากภายนอก (เช่น API response)
 *   - ส่งค่ากลับไปยัง parent เมื่อยืนยัน
 * Input  :
 *   - isOpen: boolean => เปิด/ปิด Modal
 *   - onClose: () => void => ปิด Modal
 *   - onConfirm: (name: string) => void => ส่งชื่อประเภทที่ยืนยันแล้วกลับไปให้ parent
 *   - initialValue?: string => ค่าที่ใช้กรอกตอนเริ่ม (ใช้ในกรณี "แก้ไข")
 *   - existingTags?: string[] => รายชื่อประเภททั้งหมด เพื่อใช้ตรวจสอบว่าซ้ำหรือไม่
 *   - errorMessage?: string => error message จาก parent เช่น validation หรือ API
 * Output : Modal UI component ที่ใช้งานภายในหน้า "จัดการประเภทกิจกรรม"
 */

import React, { useEffect, useState } from 'react';
import { Button } from "@/Components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  initialValue?: string;
  existingTags?: string[];
  errorMessage?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = '',
  existingTags = [],
  errorMessage,
}) => {
  const [tagName, setTagName] = useState(initialValue);        // เก็บค่าชื่อประเภทที่ผู้ใช้พิมพ์
  const [localError, setLocalError] = useState('');            // เก็บข้อความ error ภายใน modal

  /**
   * เมื่อ modal ถูกเปิดหรือค่า initialValue เปลี่ยน
   * รีเซ็ตค่าฟอร์มและเคลียร์ error ภายใน
   */
  useEffect(() => {
    setTagName(initialValue);
    setLocalError('');
  }, [initialValue, isOpen]);

  /**
   * เมื่อผู้ใช้กด "ยืนยัน" จะ:
   *   - ตรวจสอบว่าชื่อว่างหรือไม่
   *   - ตรวจสอบชื่อซ้ำกับที่มีอยู่หรือไม่
   *   - หากผ่าน validation จะส่งค่าชื่อกลับไปให้ parent
   */
  const handleSubmit = () => {
    const trimmedName = tagName.trim();

    if (!trimmedName) {
      setLocalError('กรุณากรอกชื่อประเภท');
      return;
    }

    const isDuplicate = existingTags
      .filter((tag) => tag !== initialValue) // ข้ามชื่อเดิมหากแก้ไข
      .some((tag) => tag.toLowerCase() === trimmedName.toLowerCase());

    if (isDuplicate) {
      setLocalError('ชื่อซ้ำกับที่มีอยู่แล้ว');
      return;
    }

    onConfirm(trimmedName);  // ส่งค่ากลับ
    setTagName('');
    setLocalError('');
  };

  // ถ้า modal ไม่ถูกเปิด จะไม่ render อะไรเลย
  if (!isOpen) return null;

  // ส่วนแสดงผล UI Modal
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
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
