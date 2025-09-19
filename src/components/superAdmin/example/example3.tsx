// // Super Admin หน้าจัดการบัญชี

// import React from "react";

// // (ตัวเลือก) โครงข้อมูลแถวเมื่อเชื่อม DB จริง
// type Row = {
//   accountName: string; // ชื่อบัญชี
//   role: string;        // ประเภท
//   community: string;   // ชุมชน
//   email: string;       // อีเมล
//   // คอลัมน์ "จัดการ" ปกติเป็นปุ่ม/ไอคอน ไม่จำเป็นต้องเก็บใน Row
// };

// export default function AccountManagementTable() {
//   // ===== ตำแหน่งเชื่อม DB: แทนค่าตัวแปร data ด้วยข้อมูลจริงที่ fetch มา =====
//   const data: Row[] = []; // ตัวอย่าง: const data: Row[] = fetchedRowsFromAPI;

//   // สไตล์ตามสเปค (ใช้ Tailwind arbitrary values)
//   const ROW_H = "h-12"; // = 48px (หัวตารางและเนื้อหาสูงเท่ากัน)

//   const headers = [
//     "ชื่อบัญชี",
//     "ประเภท",
//     "ชุมชน",
//     "อีเมล",
//     "จัดการ",
//   ];

//   // แสดง 10 แถวเสมอ (placeholder)
//   const TOTAL_PLACEHOLDER_ROWS = 10;
//   const rows = Array.from({ length: TOTAL_PLACEHOLDER_ROWS }, (_, i) => i);
//   const filledCount = Math.min(data.length, TOTAL_PLACEHOLDER_ROWS);

//   return (
//     <div className="w-full p-4">
//       {/* กรอบนอก + มุมโค้ง + เส้นกรอบ */}
//       <div className="overflow-hidden rounded-lg border border-[#BBE7E3]">
//         <table className="w-full table-fixed border-collapse">
//           {/* ================= THEAD ================= */}
//           <thead>
//             <tr className="bg-[#4A816F] text-white">
//               {/* คอลัมน์ checkbox (แสดงเฉพาะหัว) */}
//               <th
//                 className={[
//                   "text-left px-2",
//                   ROW_H,                      // ความสูงคงที่
//                   "align-middle",             // จัดกึ่งกลางแนวตั้ง
//                   "w-9",                      // ~36px
//                   "border-b border-[#BBE7E3]" // เส้นคั่นล่าง
//                 ].join(" ")}
//               >
//                 <input
//                   type="checkbox"
//                   aria-label="select all"
//                   className="w-[18px] h-[18px]"
//                 />
//               </th>

//               {headers.map((h) => (
//                 <th
//                   key={h}
//                   className={[
//                     "text-left px-3 text-sm font-medium",
//                     ROW_H,
//                     "align-middle",
//                     "border-b border-[#BBE7E3]"
//                   ].join(" ")}
//                 >
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           {/* ================= TBODY ================= */}
//           <tbody>
//             {rows.map((i) => {
//               // สลับสีแถว: เริ่มด้วย #A5DFD9 ก่อน
//               const rowBg = i % 2 === 0 ? "bg-[#A5DFD9]" : "bg-white";
//               const hasRowData = i < filledCount;
//               const row = hasRowData ? data[i] : undefined;

//               return (
//                 <tr key={i} className={rowBg}>
//                   {/* คอลัมน์แรก (checkbox) —> เว้นว่างถ้ายังไม่มีข้อมูล */}
//                   <td
//                     className={[
//                       "px-2",
//                       ROW_H,
//                       "align-middle",
//                       "w-9",
//                       "border-t border-[#BBE7E3]"
//                     ].join(" ")}
//                   >
//                     {hasRowData && (
//                       <input
//                         type="checkbox"
//                         aria-label={`select row ${i + 1}`}
//                         className="w-[18px] h-[18px]"
//                       />
//                     )}
//                   </td>

//                   {/* คอลัมน์ข้อมูล —> ไม่มีเส้นซ้าย/ขวา มีเฉพาะเส้นคั่นแนวนอน */}
//                   <td className={["px-3 text-sm text-gray-700", ROW_H, "align-middle", "border-t border-[#BBE7E3]"].join(" ")}>
//                     {row?.accountName /* <- ใส่ค่าจริงจาก DB ตรงนี้ */}
//                   </td>
//                   <td className={["px-3 text-sm text-gray-700", ROW_H, "align-middle", "border-t border-[#BBE7E3]"].join(" ")}>
//                     {row?.role}
//                   </td>
//                   <td className={["px-3 text-sm text-gray-700", ROW_H, "align-middle", "border-t border-[#BBE7E3]"].join(" ")}>
//                     {row?.community}
//                   </td>
//                   <td className={["px-3 text-sm text-gray-700", ROW_H, "align-middle", "border-t border-[#BBE7E3]"].join(" ")}>
//                     {row?.email}
//                   </td>
//                   <td className={["px-3 text-sm text-gray-700", ROW_H, "align-middle", "border-t border-[#BBE7E3]"].join(" ")}>
//                     {/* ปุ่ม/ไอคอนจัดการ (เช่น ดูสิทธิ์/แก้ไข/ลบ) ใส่ที่นี่ */}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>

//           {/* ================= TFOOT ================= */}
//           <tfoot>
//             <tr>
//               <td
//                 className="border-t-2 border-[#3FBAAE] bg-white"
//                 colSpan={headers.length + 1}
//               >
//                 <div className="flex items-center gap-4 px-3 py-3 text-sm text-gray-700">
//                   {/* ตอนนี้โชว์ 10 ตาม placeholder; ถ้าอยากโชว์จำนวนจริง เปลี่ยนเป็น data.length */}
//                   ทั้งหมด {TOTAL_PLACEHOLDER_ROWS} แถว
//                 </div>
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// }
