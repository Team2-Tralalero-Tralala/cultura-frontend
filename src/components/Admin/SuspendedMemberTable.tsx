// ==================================================
// SuspendedMemberTable.tsx
// Admin: ตาราง "ระงับการใช้งาน" (UI เท่านั้น / ยังไม่ผูก DB)
// เงื่อนไข:
// - แสดง 10 แถวเสมอ (placeholder) ถ้าข้อมูลจริงน้อยกว่า
// - ถ้าแถว "ไม่มีข้อมูล": ช่องว่างทั้งหมด, ไม่แสดง checkbox, ไม่แสดงไอคอนจัดการ
// - สีหัว: #4A816F | สลับแถว: #A5DFD9 / #FFFFFF (เริ่มด้วย #A5DFD9)
// - เส้นคั่นแนวนอน: #BBE7E3 | คั่น tbody↔tfoot: #3FBAAE (เส้นหนา)
// - ท้ายตารางพื้นหลังขาว, มุมโค้ง 8px
// ==================================================

import React, { useEffect, useState } from "react";

// 1) โครงข้อมูลต่อแถว (ดูจากหัวตาราง: ชื่อบัญชี / ประเภท / ชุมชน / อีเมล)
export type AccountRow = {
  accountName: string;    // ชื่อบัญชี (เช่น ชื่อผู้ใช้ / ชื่อ-สกุลที่แสดง)
  role: string;       // ประเภท (เช่น ผู้ใหญ่บ้าน / ไกด์)
  email: string;          // อีเมล
};

// 2) รองรับส่งข้อมูลจากภายนอก (ถ้ามี) หรือให้ component fetch เอง
type Props = {
  rowsFromApi?: AccountRow[];
};

export default function SuspendedMemberTable({ rowsFromApi }: Props) {
  // 3) state เก็บข้อมูลจาก DB/API
  const [data, setData] = useState<AccountRow[]>([]);

  // 4) โหลดข้อมูล: ถ้ามี rowsFromApi ให้ใช้เลย / ถ้าไม่มีให้เตรียม fetch เอง
  useEffect(() => {
    if (rowsFromApi) {
      setData(rowsFromApi);
      return;
    }

    // ▼======================= เชื่อม Database/API ตรงนี้ =======================▼
    // ตัวอย่าง fetch จาก backend (REST):
    // fetch("/api/accounts")
    //   .then(r => r.json())
    //   .then((rows: AccountRow[]) => setData(rows))
    //   .catch(() => setData([]));
    //
    // ถ้าใช้ GraphQL/Prisma ผ่าน backend → query แล้ว map เป็น AccountRow[]
    // จากนั้น setData(mappedRows);
    // ▲=======================================================================▲

    setData([]); // ตอนนี้ยังไม่มี DB → mock เป็น array ว่าง
  }, [rowsFromApi]);

  // 5) ค่าคงที่ UI
  const ROW_H = "h-12";               // ความสูงต่อแถว 48px
  const PLACEHOLDER_ROWS = 10;        // ต้องการโชว์ 10 แถวเสมอ
  const slots = Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => i);
  const filledCount = Math.min(data.length, PLACEHOLDER_ROWS);

  // 6) ชื่อหัวคอลัมน์เฉพาะตารางนี้
  const headerLabels = ["ชื่อบัญชี", "บทบาท", "ช่องทางติดต่อ", "จัดการ"];

  return (
    <div className="w-full p-4">
      {/* กรอบนอก: มุมโค้ง + เส้นกรอบ */}
      <div className="overflow-hidden rounded-lg border border-[#BBE7E3]">
        <table className="w-full table-fixed border-collapse">
          {/* ================= THEAD ================= */}
          <thead>
            <tr className="bg-[#4A816F] text-white">
              {/* checkbox รวม (หัวตารางเท่านั้น) */}
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

              // มีข้อมูลจริงใน index นี้ไหม
              const hasData = i < filledCount;
              const row = hasData ? data[i] : undefined;

              return (
                <tr key={i} className={rowBg}>
                  {/* คอลัมน์ checkbox: แสดงเฉพาะเมื่อมีข้อมูล */}
                  <td className={`px-2 ${ROW_H} align-middle w-9 border-t border-[#BBE7E3]`}>
                    {hasData ? (
                      <input
                        type="checkbox"
                        aria-label={`select row ${i + 1}`}
                        className="h-[18px] w-[18px]"
                      />
                    ) : null}
                  </td>

                  {/* คอลัมน์ข้อมูล — ถ้าไม่มีข้อมูลให้ปล่อยว่างจริง ๆ */}
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.accountName : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.role : null}
                  </td>
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? row!.email : null}
                  </td>

                  {/* คอลัมน์จัดการ: แสดงไอคอนเฉพาะเมื่อมีข้อมูล */}
                  <td className={`px-3 text-sm text-gray-700 ${ROW_H} align-middle border-t border-[#BBE7E3]`}>
                    {hasData ? (
                      <div className="flex items-center gap-3">
                        {/* ▼================ ใส่ไอคอนจริงตรงนี้ ================= ▼ */}
                        {/* <UsersIcon onClick={() => handleManageMembers(row)} /> */}
                        {/* <EditIcon  onClick={() => handleEdit(row)} /> */}
                        {/* <TrashIcon onClick={() => handleDelete(row)} /> */}
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
