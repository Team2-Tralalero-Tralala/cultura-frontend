/*
 * Filter ใช้สำหรับ Role: SuperAdmin, Admin, Member
*/

import { useState } from "react";
import { Filter } from "lucide-react";

type statusOption = "ทั้งหมด" | "เผยแพร่" | "ไม่เผยแพร่";
type approvalOption = "ทั้งหมด" | "อนุมัติ" | "รออนุมัติ" | "ถูกปฏิเสธ";

/*
 * คำอธิบาย : ฟังก์ชันหลักของ Component สำหรับจัดการการแสดงผล UI ของตัวกรอง
 * Input : currentFilters (ค่าตัวกรองปัจจุบัน), onFilterChange (ฟังก์ชัน Callback สำหรับส่งค่าการกรองกลับไป)
 * Output : ส่วนการแสดงผล (JSX) ของปุ่มตัวกรองและเมนู Dropdown
 */
export default function PackageFilter({
currentFilters,
  onFilterChange
}: any) {
  const [open, setOpen] = useState<boolean>(false);

  // กรองข้อมูลของสถานะแพ็กเกจ
   const handleShareChange = (value: string) => {
    onFilterChange("packageStatus", value);
  };

  // กรองข้อมูลของสถานะการอนุมัติ
  const handleApprovalChange = (value: string) => {
    onFilterChange("approvalStatus", value);
  };

  return (
    <div>
      {/* ปุ่มตัวกรอง */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-40 h-12 items-center justify-between px-7 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div className="flex items-center gap-5 text-gray-500 text-base">
          {/* ไอคอนกรอง */}
          <Filter className="w-4 h-4" />
          <span>ตัวกรอง</span>
        </div>
      </button>

      {/* กล่อง dropdown */}
      {open && (
        <div className="absolute w-40 z-10 mt-2 bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* สถานะแพ็กเกจ */}
          <div>
            <p className="text-gray-500 mb-2">สถานะแพ็กเกจ</p>
            <div className="space-y-2 text-gray-500">
              {(["ทั้งหมด", "เผยแพร่", "ไม่เผยแพร่"] as statusOption[]).map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="packageStatus"
                    value={item}
                    checked={currentFilters.packageStatus === item}
                    onChange={() => handleShareChange(item)}
                    className="text-green-500 focus:ring-green-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* สถานะการอนุมัติ */}
          <div>
            <p className="text-gray-500 mb-2">สถานะการอนุมัติ</p>
            <div className="space-y-2 text-gray-500">
              {(["ทั้งหมด", "อนุมัติ", "รออนุมัติ", "ถูกปฏิเสธ"] as approvalOption[]).map(
                (item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalStatus"
                      value={item}
                      checked={currentFilters.approvalStatus === item}
                      onChange={() => handleApprovalChange(item)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    {item}
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
