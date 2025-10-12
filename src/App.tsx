import React, { useState } from "react";
import Modal from "./Components/modal";

/* 
 * คำอธิบาย : หน้า CreatePackagePage สำหรับยืนยันการสร้างแพ็กเกจ
 * เมื่อผู้ใช้กดปุ่ม "สร้าง" จะมี Modal ยืนยันแสดงขึ้นมา
 * Input  : ไม่มี
 * Output : UI หน้ายืนยันการสร้างแพ็กเกจ
 */

const CreatePackagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);// State สำหรับควบคุมการเปิด-ปิด Modal

  // ฟังก์ชันเมื่อผู้ใช้กดยืนยันการสร้างแพ็กเกจ
  const handleConfirm = () => {
    setIsModalOpen(false);// ปิด Modal หลังจากยืนยัน
  };

  return (
    <div className="p-6">
      {/* ปุ่มสร้างแพ็กเกจ */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#055035] text-white px-6 py-2 rounded-lg hover:bg-[#033d29] transition font-sarabun font-semibold"
      >
        สร้าง
      </button>

      {/* Modal ยืนยัน */}
      <Modal
        isOpen={isModalOpen}
        title="ยืนยันการสร้างแพ็กเกจ"
        message="คุณต้องการยืนยันการสร้างแพ็กเกจนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CreatePackagePage;
