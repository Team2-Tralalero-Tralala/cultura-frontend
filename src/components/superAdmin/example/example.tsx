// // Super Admin หน้าจัดการชุมชน
// import React from "react";

// // (ตัวเลือก) นิยามชนิดข้อมูลของแต่ละแถว เพื่อเวลาต่อฐานข้อมูลจะพิมพ์ไม่ผิด
// type Row = {
//   accountName: string;       // ชื่อบัญชี
//   communityName: string;     // ชื่อชุมชน
//   manager: string;           // คนดูแล
//   packageStatus: string;     // สถานะแพ็กเกจ
//   approvalStatus: string;    // สถานะการอนุมัติ
//   // หมายเหตุ: คอลัมน์ "จัดการ" มักเป็นปุ่ม/ไอคอน ไม่ต้องเก็บใน Row ก็ได้
// };

// export default function CommunityManagementTable() {
//   // =========================
//   // ✅ ตำแหน่งนำข้อมูลจาก Database มาใส่
//   //    - เวลาคุณ fetch ข้อมูลจาก API/DB แล้ว ให้ map เป็น Row[] แล้วแทนตัวแปร data นี้
//   //    - ตัวอย่าง (สมมติ): const data: Row[] = fetchedRowsFromDB;
//   // =========================
//   const data: Row[] = []; // <-- ใส่ข้อมูลจริงจากฐานข้อมูลตรงนี้

//   // ค่าคงที่สี/สไตล์ตามสเปค
//   const borderColor = "#BBE7E3"; // สีเส้นคั่นแนวนอน
//   const zebraA = "#A5DFD9";      // สีแถวเริ่มต้น
//   const zebraB = "#FFFFFF";       // สีแถวสลับ
//   const ROW_H = 48;               // ✅ สูงของทั้งหัวตารางและเนื้อหา (px) เท่ากัน

//   // หัวคอลัมน์ตามดีไซน์
//   const headers = [
//     "ชื่อบัญชี",
//     "ชื่อชุมชน",
//     "คนดูแล",
//     "สถานะแพ็กเกจ",
//     "สถานะการอนุมัติ",
//     "จัดการ",
//   ];

//   // แสดง 10 แถวเสมอ (placeholder)
//   const TOTAL_PLACEHOLDER_ROWS = 10;
//   const rows = Array.from({ length: TOTAL_PLACEHOLDER_ROWS }, (_, i) => i);

//   // จำนวนแถวที่ “มีข้อมูลจริง” (ถ้า data น้อยกว่า 10 แถว ที่เหลือจะเป็นแถวว่าง)
//   const filledCount = Math.min(data.length, TOTAL_PLACEHOLDER_ROWS);

//   return (
//     <div className="w-full p-4">
//       <div
//         className="overflow-hidden"
//         style={{ border: `1px solid ${borderColor}`, borderRadius: 8 }}
//       >
//         <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
//           {/* =========================
//               THEAD (หัวตาราง)
//               - สีพื้น #4A816F ตัวอักษรขาว
//               - ความสูงเท่าช่องเนื้อหา (ROW_H)
//               - มี checkbox เฉพาะหัวตาราง (ตามที่สเปคกำหนด)
//              ========================= */}
//           <thead>
//             <tr style={{ backgroundColor: "#4A816F", color: "#FFFFFF" }}>
//               <th
//                 className="text-left px-2 py-0"
//                 style={{
//                   borderBottom: `1px solid ${borderColor}`,
//                   width: 36,
//                   height: ROW_H,              // ✅ ทำให้หัวตารางสูงเท่าแถวเนื้อหา
//                   verticalAlign: "middle",    // จัดให้อยู่กึ่งกลางแนวตั้ง
//                 }}
//               >
//                 <input type="checkbox" aria-label="select all" style={{ width: 18, height: 18 }} />
//               </th>
//               {headers.map((h, idx) => (
//                 <th
//                   key={idx}
//                   className="text-left px-3 py-0 text-sm font-medium"
//                   style={{
//                     borderBottom: `1px solid ${borderColor}`,
//                     height: ROW_H,             // ✅ ทำให้หัวตารางสูงเท่าช่องเนื้อหา
//                     verticalAlign: "middle",
//                   }}
//                 >
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           {/* =========================
//               TBODY (เนื้อหาตาราง)
//               - เส้นคั่นเฉพาะแนวนอน (borderTop)
//               - แถวสลับสี A5DFD9 / FFFFFF เริ่มด้วย A5DFD9
//               - ✅ ถ้าแถวนั้น "มีข้อมูล" -> แสดง checkbox + ค่าในแต่ละคอลัมน์
//               - ✅ ถ้าแถวนั้น "ไม่มีข้อมูล" -> ปล่อยว่างทุกช่อง (รวมคอลัมน์ checkbox)
//              ========================= */}
//           <tbody>
//             {rows.map((i) => {
//               const bg = i % 2 === 0 ? zebraA : zebraB;
//               const hasRowData = i < filledCount; // มีข้อมูลจริงใน index นี้หรือไม่

//               // ดึงค่าจาก data เฉพาะแถวที่มีข้อมูลจริง
//               const row = hasRowData ? data[i] : undefined;

//               return (
//                 <tr key={i} style={{ backgroundColor: bg }}>
//                   {/* คอลัมน์ checkbox (แสดงเฉพาะเมื่อมีข้อมูลจริงตามสเปค) */}
//                   <td
//                     className="px-2 py-0"
//                     style={{
//                       borderTop: `1px solid ${borderColor}`,
//                       width: 36,
//                       height: ROW_H,
//                       verticalAlign: "middle",
//                     }}
//                   >
//                     {hasRowData && (
//                       <input
//                         type="checkbox"
//                         aria-label={`select row ${i + 1}`}
//                         style={{ width: 18, height: 18 }}
//                       />
//                     )}
//                   </td>

//                   {/* คอลัมน์ข้อมูล */}
//                   {/* หมายเหตุ: ไม่มีเส้นซ้าย/ขวา มีเฉพาะเส้นคั่นแนวนอน (borderTop) */}
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {row?.accountName /* <- ใส่ค่าจริงจาก DB ตรงนี้ */}
//                   </td>
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {row?.communityName}
//                   </td>
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {row?.manager}
//                   </td>
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {row?.packageStatus}
//                   </td>
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {row?.approvalStatus}
//                   </td>
//                   <td
//                     className="px-3 py-0 text-sm text-gray-700 align-middle"
//                     style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                   >
//                     {/* ปกติใส่ปุ่ม/ไอคอน จัดการ เช่น แก้ไข/ลบ */}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>

//           {/* =========================
//               TFOOT (ท้ายตาราง)
//               - เส้นคั่นระหว่าง tbody/tfoot = #3FBAAE
//               - พื้นหลังสีขาว
//               - ตอนนี้โชว์ “ทั้งหมด 10 แถว” ตาม mock (ถ้าต้องการจำนวนจริง -> เปลี่ยนเป็น data.length)
//              ========================= */}
//           <tfoot>
//             <tr>
//               <td
//                 colSpan={headers.length + 1}
//                 style={{ borderTop: `2px solid #3FBAAE`, backgroundColor: "#FFFFFF" }}
//               >
//                 <div className="flex items-center gap-4 px-3 py-3 text-sm">
//                   <div className="text-gray-700">
//                     ทั้งหมด {TOTAL_PLACEHOLDER_ROWS} แถว
//                     {/* ถ้าอยากแสดงจำนวนข้อมูลจริงให้เปลี่ยนเป็น: ทั้งหมด {data.length} แถว */}
//                   </div>
//                 </div>
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// }
