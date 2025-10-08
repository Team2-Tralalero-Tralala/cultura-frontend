import { useEffect, useState } from "react";
import flatpickr from "flatpickr";
import { Thai } from "flatpickr/dist/l10n/th";
import "flatpickr/dist/flatpickr.min.css";

/**
 * Component: PackageDatePicker
 * แปลงจาก HTML เดิมเป็น React + TypeScript + Tailwind
 */
export default function selectDate() {
  const [isMultiDay, setIsMultiDay] = useState(false);

  useEffect(() => {
    // ตั้งค่า flatpickr ภาษาไทย
    flatpickr.localize(Thai);

    flatpickr("#activityDate", {
      dateFormat: "d/m/Y",
    });

    flatpickr("#startDate", {
      dateFormat: "d/m/Y",
    });

    flatpickr("#endDate", {
      dateFormat: "d/m/Y",
    });
  }, []);

  return (
    <div className="font-[Sarabun] p-10 bg-[#f6f6f6] min-h-screen flex items-start justify-center">
      <div className="bg-white border border-[#696969] rounded-[11px] w-[292px] h-[235px] p-5 shadow-sm">
        <h2 className="text-[20px] font-bold mb-2">ตัวเลือกแพ็กเกจ</h2>

        {/* ปุ่มเลือกกิจกรรม */}
        <div className="flex border border-[#00bf6a] rounded-xl overflow-hidden mb-3">
          <button
            type="button"
            onClick={() => setIsMultiDay(false)}
            className={`flex-1 py-2 font-semibold text-[16px] transition-colors ${
              !isMultiDay
                ? "bg-[#00bf6a] text-white"
                : "bg-white text-black hover:bg-[#f0f0f0]"
            }`}
          >
            กิจกรรมวันเดียว
          </button>
          <button
            type="button"
            onClick={() => setIsMultiDay(true)}
            className={`flex-1 py-2 font-semibold text-[16px] transition-colors ${
              isMultiDay
                ? "bg-[#00bf6a] text-white"
                : "bg-white text-black hover:bg-[#f0f0f0]"
            }`}
          >
            กิจกรรมหลายวัน
          </button>
        </div>

        {/* ฟอร์มเลือกวันที่ */}
        <div className="flex flex-col gap-3 -mb-2">
          {!isMultiDay ? (
            <div>
              <label
                htmlFor="activityDate"
                className="font-semibold mb-1 block"
              >
                วันที่เข้าร่วมกิจกรรม
              </label>
              <input
                id="activityDate"
                type="text"
                className="w-full border border-[#696969] rounded-[15px] px-3 py-2 text-center text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00bf6a]"
                placeholder=""
              />
            </div>
          ) : (
            <div>
              <label htmlFor="startDate" className="font-semibold mb-1 block">
                วันที่เข้าร่วมกิจกรรม
              </label>
              <input
                id="startDate"
                type="text"
                className="w-full border border-[#696969] rounded-[15px] px-3 py-2 mb-2 text-center text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00bf6a]"
                placeholder=""
              />
              <input
                id="endDate"
                type="text"
                className="w-full border border-[#696969] rounded-[15px] px-3 py-2 text-center text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00bf6a]"
                placeholder=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
