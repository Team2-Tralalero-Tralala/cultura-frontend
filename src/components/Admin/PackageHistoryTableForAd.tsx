

// ================================================
// PackageHistoryTableForAd.tsx
// Admin: ตาราง "ประวัติแพ็กเกจ" (UI เท่านั้น / ยังไม่ผูก DB)
// เงื่อนไขสำคัญ:
// - แสดง 10 แถวเสมอ (placeholder) ถ้าข้อมูลจริงน้อยกว่า
// - ถ้าแถว "ไม่มีข้อมูล": ช่องทั้งหมดว่าง, ไม่แสดง checkbox, ไม่แสดงไอคอนจัดการ
// - สีหัว: #4A816F | สลับแถว: #A5DFD9 / #FFFFFF (เริ่มด้วย #A5DFD9)
// - เส้นคั่นแนวนอน: #BBE7E3 | คั่น tbody↔tfoot: #3FBAAE (เส้นหนา)
// - ท้ายตารางพื้นหลังขาว, มุมโค้ง 8px
// ================================================

import React, { useEffect, useState } from "react";

// 1) โครงข้อมูลต่อแถว (ตอนต่อ DB จริง ให้ map เข้ามารูปแบบนี้)
export type PackageRow = {
  packageName: string;     // ชื่อแพ็กเกจ
  communityName: string;   // ชื่อชุมชน
  manager: string;         // คนดูแล
  packageStatus: string;   // สถานะแพ็กเกจ (เผยแพร่ / ไม่เผยแพร่)
  dueDate: string;       // วันหมดอายุ
};

// 2) พร็อพรองรับการส่งข้อมูลจากภายนอกได้ด้วย (ถ้าอยากควบคุมจากหน้า parent)
type Props = {
  rowsFromApi?: PackageRow[];
};

export default function PackageHistoryTableForAd({ rowsFromApi }: Props) {
  // 3) state เก็บข้อมูลที่ดึงมา (ตอนนี้ mock: ว่าง)
  const [data, setData] = useState<PackageRow[]>([]);

  // 4) เมื่อมีการส่ง rowsFromApi เข้ามา ให้ใช้เลย / ถ้าไม่มีให้ mock ว่างไว้ก่อน
  useEffect(() => {
    if (rowsFromApi) {
      setData(rowsFromApi);
      return;
    }

    // ▼======================= เชื่อม Database/API ตรงนี้ =======================▼
    // ตัวอย่างการ fetch ข้อมูลจาก backend (REST API)
    // fetch("/api/communities")
    //   .then(r => r.json())
    //   .then((res: CommunityRow[]) => setData(res))
    //   .catch(() => setData([]));
    //
    // ถ้าใช้ GraphQL หรือ Prisma ผ่าน backend → ดึงข้อมูลแล้ว map เป็น CommunityRow[]
    // จากนั้น setData(mappedRows);
    // ▲=======================================================================▲

    setData([]); // ตอนนี้ยังไม่มี DB → mock เป็น array ว่าง
  }, [rowsFromApi]);

  // 5) ค่าคงที่ UI
  const ROW_H = "h-12"; // สูง 48px
  const PLACEHOLDER_ROWS = 10; // ต้องการโชว์ 10 แถวเสมอ
  const headerLabels = [ "ชื่อแพ็กเกจ", "ชื่อชุมชน", "คนดูแล", "สถานะแพ็กเกจ", "เวลาสิ้นสุด", "จัดการ"];

  // 6) เตรียม index 0..9 สำหรับ render 10 แถว
  const slots = Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => i);

  // 7) จำนวนข้อมูลจริงที่มี (ไม่เกิน 10)
  const filledCount = Math.min(data.length, PLACEHOLDER_ROWS);

  return (
    <div className="w-full p-4">
      {/* กรอบนอก: มุมโค้ง + เส้นกรอบรอบนอก (ไม่ใช่เส้นคั่นในตาราง) */}
      <div className="overflow-hidden rounded-lg border border-[#BBE7E3]">
        <table className="w-full table-fixed border-collapse">
          {/* ================= THEAD ================= */}
          <thead>
            <tr className="bg-[#4A816F] text-white">
              {/* หัว checkbox (หัวตารางเท่านั้น) */}
              <th className={`text-left px-2 ${ROW_H} align-middle w-9`}>
                <input type="checkbox" aria-label="select all rows" className="h-[18px] w-[18px]" />
              </th>

              {/* หัวคอลัมน์อื่น ๆ */}
              {headerLabels.map((label) => (
                <th
                  key={label}
                  className={`text-left px-3 text-sm font-medium ${ROW_H} align-middle`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          {/* ================= TBODY ================= */}
          <tbody>
            {slots.map((i) => {
              // สลับสีแถว เริ่มด้วย A5DFD9
              const rowBg = i % 2 === 0 ? "bg-[#A5DFD9]" : "bg-white";

              // มีข้อมูลจริงใน index นี้หรือไม่
              const hasData = i < filledCount;
              const row = hasData ? data[i] : undefined;

              return (
                <tr key={i} className={rowBg}>
                  {/* คอลัมน์ checkbox: แสดงเฉพาะเมื่อมีข้อมูล row */}
                  <td className={`px-2 ${ROW_H} align-middle w-9 border-t border-[#BBE7E3]`}>
                    {hasData ? (
                      <input
                        type="checkbox"
                        aria-label={`select row ${i + 1}`}
                        className="h-[18px] w-[18px]"
                      />
                    ) : null}
                  </td>

                  {/* คอลัมน์ข้อมูล: ถ้าไม่มีข้อมูล → ปล่อยว่างจริงๆ */}
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.packageName : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.communityName : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.manager : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.packageStatus : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.dueDate : null}
                  </td>

                  {/* คอลัมน์จัดการ: แสดงไอคอนเฉพาะเมื่อมีข้อมูล */}
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? (
                      <div className="flex items-center justify-start gap-3">
                        {/* ▼================ ใส่ไอคอนจริงตรงนี้ ================= ▼ */}
                        {/* <EditIcon onClick={() => handleEdit(row)} /> */}
                        {/* <DeleteIcon onClick={() => handleDelete(row)} /> */}
                        {/* ▲===================================================▲ */}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* ================= TFOOT ================= */}
          <tfoot>
            <tr>
              <td colSpan={headerLabels.length + 1} className="bg-white border-t-4 border-[#3FBAAE]">
                <div className="px-3 py-3 text-sm text-gray-700">
                  {/* จำนวนจริงจาก data.length; ถ้าไม่มีข้อมูล → 0 แถว */}
                  ทั้งหมด {data.length} แถว
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
