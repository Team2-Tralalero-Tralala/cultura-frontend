// import React from "react";

// /**
//  * Static UI table like the example image
//  * - Header color: #4A816F
//  * - Rows alternate: #A5DFD9 / #FFFFFF (start with #A5DFD9)
//  * - Border color between rows only: #BBE7E3 (horizontal lines only)
//  * - Divider between body and footer: #3FBAAE
//  * - Footer background: #FFFFFF
//  * - Rounded corners: 8px
//  * - Always show 10 placeholder rows (empty cells)
//  * - **No checkbox in tbody** when rows are empty (UI-only placeholder)
//  * - Header checkbox is always visible
//  * - Footer shows "ทั้งหมด 10 แถว" (mocked as 10)
//  */
// export default function ThaiAdminTable() {
//   const total = 10; // fixed 10 rows placeholder
//   const rows = Array.from({ length: total }, (_, i) => i);

//   const headers = [
//     "ชื่อบัญชี",
//     "ชื่อชุมชน",
//     "คนดูแล",
//     "สถานะแพ็กเกจ",
//     "สถานะการอนุมัติ",
//     "จัดการ",
//   ];

//   const borderColor = "#BBE7E3";
//   const zebraA = "#A5DFD9";
//   const zebraB = "#FFFFFF";
//   const ROW_H = 48; // <<< fixed body row height in px

//   return (
//     <div className="w-full p-4">
//       <div
//         className="overflow-hidden"
//         style={{ border: `1px solid ${borderColor}`, borderRadius: 8 }}
//       >
//         <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
//           <thead>
//             <tr style={{ backgroundColor: "#4A816F", color: "#FFFFFF" }}>
//               <th
//                 className="text-left px-2 py-3"
//                 style={{ borderBottom: `1px solid ${borderColor}`, width: 36 }}
//               >
//                 {/* Header checkbox (always visible) */}
//                 <input type="checkbox" aria-label="select all" style={{ width: 18, height: 18 }} />
//               </th>
//               {headers.map((h, idx) => (
//                 <th
//                   key={idx}
//                   className="text-left px-3 py-3 text-sm font-medium"
//                   style={{ borderBottom: `1px solid ${borderColor}` }}
//                 >
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((i) => {
//               const bg = i % 2 === 0 ? zebraA : zebraB;
//               return (
//                 <tr key={i} style={{ backgroundColor: bg }}>
//                   {/* Body checkbox column left intentionally empty when no data */}
//                   <td
//                     className="px-2 py-0"
//                     style={{ borderTop: `1px solid ${borderColor}`, width: 36, height: ROW_H, verticalAlign: "middle" }}
//                   />
//                   {headers.map((_, ci) => (
//                     <td
//                       key={ci}
//                       className="px-3 py-0 text-sm text-gray-700 align-middle"
//                       style={{ borderTop: `1px solid ${borderColor}`, height: ROW_H, verticalAlign: "middle" }}
//                     ></td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>

//           <tfoot>
//             <tr>
//               <td
//                 colSpan={headers.length + 1}
//                 style={{ borderTop: `2px solid #3FBAAE`, backgroundColor: "#FFFFFF" }}
//               >
//                 <div className="flex items-center gap-4 px-3 py-3 text-sm">
//                   <div className="text-gray-700">ทั้งหมด {total} แถว</div>
//                 </div>
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// }
