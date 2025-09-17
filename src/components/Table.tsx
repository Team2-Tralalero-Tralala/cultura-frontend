import React, { useMemo, useState } from "react";

/**
 * Reusable DataTable component
 * - รองรับจำนวนคอลัมน์ไม่ตายตัว (กำหนดผ่าน props.columns)
 * - แสดง footer: "ทั้งหมด X แถว" + dropdown จำนวนแถวต่อหน้า (10/30/50) — ค่าเริ่มต้น 10
 * - ไม่ทำ pagination (ไม่มีปุ่มก่อนหน้า/ถัดไป)
 * - ใช้ได้กับหลายตารางที่หัวไม่เหมือนกัน แค่ส่ง columns และ data ใหม่เข้ามา
 */
export function DataTable({
  columns,
  data,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [10, 30, 50],
  tableTitle,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // ข้อมูลที่แสดงจริง (ตัดให้เหลือเท่าที่เลือก)
  const visibleData = useMemo(
    () => (Array.isArray(data) ? data.slice(0, rowsPerPage) : []),
    [data, rowsPerPage]
  );

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      {tableTitle && (
        <div className="mb-2 text-sm text-gray-600">{tableTitle}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse">
          <thead>
            <tr className="bg-[#2b7a78] text-white">
              {/* checkbox ทั้งแถวแบบในภาพ */}
              <th className="w-12 p-3 text-left">
                <input type="checkbox" />
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.key ?? idx}
                  className="p-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

        {/*
          ตามโจทย์ "ข้อมูลไม่ต้องใส่" ได้ — ถ้า data=[] จะขึ้นแถบว่าง และ footer จะบอกจำนวนทั้งหมดตามจริง
        */}
          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-gray-500 border-t"
                  colSpan={columns.length + 1}
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              visibleData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx % 2 === 0
                      ? "bg-white border-t"
                      : "bg-[#f7fbfb] border-t"
                  }
                >
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-3 text-sm text-gray-800 align-top"
                    >
                      {/* รองรับทั้ง string และ ReactNode */}
                      {row[col.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3">
          <div className="text-sm text-gray-700">
            ทั้งหมด {data?.length ?? 0} แถว
          </div>

          <label className="text-sm text-gray-700 inline-flex items-center gap-2">
            <span>จำนวนแถวต่อหน้า :</span>
            <select
              className="border rounded-md px-2 py-1"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

/** ------------------ ตัวอย่างใช้งาน ------------------
 * คุณมีหลายตาราง หัวไม่เหมือน/จำนวนคอลัมน์ไม่เท่ากัน
 * แค่เตรียม columns และ data ให้ตรงกัน ก็ใช้ <DataTable /> ตัวเดิมได้เลย
 */
export default function App() {
  // 1) นิยามคอลัมน์แบบไดนามิก — โจทย์ขอ 10 คอลัมน์ (ไม่รวมคอลัมน์ checkbox)
  const columns10 = [
    { key: "col1", header: "ชื่อแพ็กเกจ" },
    { key: "col2", header: "ชื่อชุมชน" },
    { key: "col3", header: "คนดูแล" },
    { key: "col4", header: "สถานะแพ็กเกจ" },
    { key: "col5", header: "สถานะการอนุมัติ" },
    { key: "col6", header: "จัดการ" },
    { key: "col7", header: "คอลัมน์ 7" },
    { key: "col8", header: "คอลัมน์ 8" },
    { key: "col9", header: "คอลัมน์ 9" },
    { key: "col10", header: "คอลัมน์ 10" },
  ];

  // 2) ตัวอย่าง data สำหรับเดโม (เพื่อให้ footer โชว์ "ทั้งหมด 10 แถว")
  //    ถ้าไม่อยากใส่ข้อมูลจริง ให้เปลี่ยนเป็น [] ได้เลย
  const mock10rows = Array.from({ length: 10 }, (_, i) => ({
    col1: `แพ็กเกจที่ ${i + 1}`,
    col2: `ชุมชน ${i + 1}`,
    col3: `คนดูแล ${i + 1}`,
    col4: i % 2 === 0 ? "เผยแพร่" : "ไม่เผยแพร่",
    col5: i % 3 === 0 ? "อนุมัติ" : "รออนุมัติ",
    col6: "—",
    col7: "—",
    col8: "—",
    col9: "—",
    col10: "—",
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">ตารางตัวอย่าง (10 คอลัมน์)</h1>
      <DataTable
        tableTitle="แพ็กเกจท่องเที่ยว"
        columns={columns10}
        data={mock10rows}
        initialRowsPerPage={10}
        rowsPerPageOptions={[10, 30, 50]}
      />

      {/* ------------ ตัวอย่างอีกตาราง (หัวไม่เหมือน / คอลัมน์ไม่เท่ากัน) ------------ */}
      <div className="mt-10" />
      <h2 className="text-lg font-semibold mb-2">อีกตาราง (5 คอลัมน์ ไม่ต้องแก้ component)</h2>
      <DataTable
        columns={[
          { key: "a", header: "รหัส" },
          { key: "b", header: "ชื่อ" },
          { key: "c", header: "ประเภท" },
          { key: "d", header: "สถานะ" },
          { key: "e", header: "วันที่อัปเดต" },
        ]}
        data={[]}
        initialRowsPerPage={10}
      />
    </div>
  );
}
