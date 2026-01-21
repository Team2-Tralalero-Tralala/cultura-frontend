/**
 * คำอธิบาย: Component Dropdown Filter Status สำหรับ Role: Tourists
 */
import { useState } from "react";

type StatusOption = "ทั้งหมด" | "จองสำเร็จ" | "ยกเลิกการจอง";
type ApprovalOption = "ทั้งหมด" | "7 วัน" | "1 เดือน" | "1 ปี";

/**
 * คำอธิบาย: Component Dropdown Filter Status สำหรับ Role: Tourists
 * input: -
 * output: UI Dropdown สำหรับกรองสถานะและการอนุมัติ
 */
export default function FiltersStatusForTR() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [packageStatus, setPackageStatus] = useState<StatusOption>("ทั้งหมด");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalOption>("ทั้งหมด");

  // กรองข้อมูลของสถานะแพ็กเกจ
  const handlePackageStatusChange = (value: string) => {
    setPackageStatus(value as StatusOption);
    console.log("กรองตามสถานะการเผยแพร่:", value);
    //ยังไม่ได้เขียนโค้ดกรองข้อมูลจริง
  };

  // กรองข้อมูลของสถานะการอนุมัติ
  const handleApprovalStatusChange = (value: string) => {
    setApprovalStatus(value as ApprovalOption);
    console.log("กรองตามสถานะอนุมัติ:", value);
    //ยังไม่ได้เขียนโค้ดกรองข้อมูลจริง
  };

  return (
    <div>
      {/* ปุ่มตัวกรอง */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-40 h-12 items-center justify-between px-7 py-2 bg-white border border-black rounded-lg hover:bg-gray-50"
      >
        <div className="flex items-center gap-5 text-black text-base">
          {/* ไอคอนกรอง */}
          <span>ตัวกรอง</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 18v-2h6v2zm0-5v-2h12v2zm0-5V6h18v2z" />
          </svg>
        </div>
      </button>

      {/* กล่อง dropdown */}
      {isOpen && (
        <div className="absolute w-40 z-10 mt-2 bg-white border border-black rounded-lg p-4 space-y-4">
          {/* สถานะแพ็กเกจ */}
          <div>
            <p className="text-black mb-2">สถานะ</p>
            <div className="space-y-2 text-black">
              {(["ทั้งหมด", "จองสำเร็จ", "ยกเลิกการจอง"] as StatusOption[]).map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="packageStatus"
                    value={item}
                    checked={packageStatus === item}
                    onChange={() => handlePackageStatusChange(item)}
                    className="text-green-500 focus:ring-green-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* สถานะการอนุมัติ */}
          <div>
            <p className="text-black mb-2">ย้อนหลัง</p>
            <div className="space-y-2 text-black">
              {(["ทั้งหมด", "7 วัน", "1 เดือน", "1 ปี"] as ApprovalOption[]).map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="approvalStatus"
                    value={item}
                    checked={approvalStatus === item}
                    onChange={() => handleApprovalStatusChange(item)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
