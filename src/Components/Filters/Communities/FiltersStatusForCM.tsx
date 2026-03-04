/**
 * คำอธิบาย: Component สำหรับจัดการการแสดงผล UI ของตัวกรองสถานะแพ็กเกจ (Status & Approval)
 */
import { useState } from "react";
import { Filter } from "lucide-react";

type StatusOption = "ทั้งหมด" | "เผยแพร่" | "ไม่เผยแพร่";
type ApprovalOption = "ทั้งหมด" | "อนุมัติ" | "รออนุมัติ" | "ถูกปฏิเสธ";
/**
 * คำอธิบาย: Component สำหรับจัดการการแสดงผล UI ของตัวกรองสถานะแพ็กเกจ (Status & Approval)
 * input: currentFilters (any), onFilterChange (function)
 * output: JSX.Element
 */
export default function FiltersStatusForCM({
  currentFilters,
  onFilterChange,
}: {
  currentFilters: any;
  onFilterChange: (type: string, value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // กรองข้อมูลของสถานะแพ็กเกจ
  const handlePackageStatusChange = (value: string) => {
    onFilterChange("packageStatus", value);
  };

  // กรองข้อมูลของสถานะการอนุมัติ
  const handleApprovalStatusChange = (value: string) => {
    onFilterChange("approvalStatus", value);
  };

  return (
    <div>
      {/* ปุ่มตัวกรอง */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-40 h-12 items-center justify-between px-7 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div className="flex items-center gap-5 text-gray-500 text-base">
          {/* ไอคอนกรอง */}
          <Filter className="w-4 h-4" />
          <span>ตัวกรอง</span>
        </div>
      </button>

      {/* กล่อง dropdown */}
      {isOpen && (
        <div className="absolute w-40 z-10 mt-2 bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* สถานะแพ็กเกจ */}
          <div>
            <p className="text-gray-500 mb-2">สถานะแพ็กเกจ</p>
            <div className="space-y-2 text-gray-500">
              {(["ทั้งหมด", "เผยแพร่", "ไม่เผยแพร่"] as StatusOption[]).map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="packageStatus"
                    value={item}
                    checked={currentFilters.packageStatus === item}
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
            <p className="text-gray-500 mb-2">สถานะการอนุมัติ</p>
            <div className="space-y-2 text-gray-500">
              {(["ทั้งหมด", "อนุมัติ", "รออนุมัติ", "ถูกปฏิเสธ"] as ApprovalOption[]).map(
                (item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalStatus"
                      value={item}
                      checked={currentFilters.approvalStatus === item}
                      onChange={() => handleApprovalStatusChange(item)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    {item}
                  </label>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
