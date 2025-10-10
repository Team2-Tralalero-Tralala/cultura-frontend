// /*
// * คำอธิบาย : ตัวอย่างการใช้งาน DataTable สำหรับแสดงรายการผู้ใช้
// * กำหนดคอลัมน์ ปุ่มจัดการต่อแถว (edit/block/unblock/delete)
// * และปุ่มดำเนินการแบบกลุ่ม (bulk delete / bulk unblock) พร้อมข้อมูลจำลอง
// */

// import DataTable, { type Column, type DataTableProps } from "./Components/Tables/Index";
// import { TrashIcon, BanIcon } from "./Components/Tables/Icon"; 
// import { useMemo } from "react";
// import { Route, Routes, Navigate } from "react-router";

// import SuperAdminLayout from './Layouts/SuperAdmin/SuperAdminLayout';
// import SuperAdminRoutes from './Layouts/SuperAdmin/SuperAdminRoutes';

// import AdminLayout from './Layouts/Admin/AdminLayout';
// import AdminRoutes from './Layouts/Admin/AdminRoutes';

// import MemberLayout from './Layouts/Member/MemberLayout';
// import MemberRoutes from './Layouts/Member/MemberRoutes';


// function SidebarForSuperAdmin() {
//   return (
//     <Routes>
//       <Route path="/super/*" element={<SuperAdminLayout />}>
//         {/* เส้นทางภายใน /super/ ทั้งหมด */}
//         <Route path="*" element={<SuperAdminRoutes />} />
//       </Route>

//       {/* fallback */}
//       <Route path="*" element={<Navigate to="/super/" replace />} />
//     </Routes>
//   );
// }

// function SidebarForAdmin() {
//   return (
//     <Routes>
//       <Route path="/admin/*" element={<AdminLayout />}>
//         {/* เส้นทางภายใน /super/ ทั้งหมด */}
//         <Route path="*" element={<AdminRoutes />} />
//       </Route>

//       {/* fallback */}
//       <Route path="*" element={<Navigate to="/admin/" replace />} />
//     </Routes>
//   );
// }

// function SidebarForMember() {
//   return (
//     <div className="flex h-screen">
//       <div className="flex-1 p-8 overflow-auto">
//         <Routes>
//           <Route path="/member/*" element={<MemberLayout />}>
//             <Route path="*" element={<MemberRoutes />} />
//           </Route>
//         </Routes>
//       </div>
//     </div>
//   );
// }

// function App() {
//   type Row = { id: number; name: string; role: string; community: string; email: string; suspended?: boolean; };

//   const columns: Column<Row>[] = [
//     { key: "name", header: "ชื่อ" },
//     { key: "role", header: "ประเภท" },
//     { key: "community", header: "ชุมชน" },
//     { key: "email", header: "อีเมล" },
    
//   ];

//   const actions: NonNullable<DataTableProps<Row>["actions"]> = {
//     header: "จัดการ",
//     align: "right",
//     width: "200px",
//     variant: "icons",
//     className: "pr-10",
//     items: (r) => ["edit", r.suspended ? "unblock" : "block", "delete"],
//     // callbacks: {
//     //   edit:    (r) => console.log("edit", r.id),
//     //   block:   (r) => console.log("block", r.id),
//     //   unblock: (r) => console.log("unblock", r.id),
//     //   delete:  (r) => console.log("delete", r.id),
//     // },
//   };


//   const bulkActions: NonNullable<DataTableProps<Row>["bulkActions"]> = [
//     {
//       id: "bulk-delete",
//       label: "ลบทั้งหมด",
//       icon: TrashIcon,
//       intent: "neutral",
//       onClick: async (rows) => {
//         const ids = rows.map(r => r.id);
//         console.log("bulk delete ids:", ids);
//         // ตัวอย่างเชื่อม backend:
//         // await fetch("/api/users/bulk-delete", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids }) });
      
//       },   
//     },
//     {
//     id: "bulk-unblock",
//     label: "ยกเลิกการระงับทั้งหมด",
//     icon: BanIcon,
//     intent: "neutral", 
//     onClick: async (rows) => {
//       const ids = rows.map(r => r.id);
//       console.log("bulk unblock ids:", ids);
//     },
//   },
    
//   ];

//   const rows = useMemo<Row[]>(
//     () => Array.from({ length: 111 }, (_, i) => ({
//       id: i + 1,
//       name: `ผู้ใช้ ${i + 1}`,
//       role: i % 3 === 0 ? "ผู้ดูแลระบบ" : "สมาชิก",
//       community: ["บ้านแว้ว", "คลองสระบัว", "สามช่อง"][i % 3],
//       email: `user${i + 1}@ex.com`,
//       suspended: i % 7 === 0,
//     })), []
//   );

//   return (
//     <DataTable<Row>
//       data={rows}
//       columns={columns}
//       getRowKey={(r) => r.id}
//       actions={actions}
//       bulkActions={bulkActions}      
//       pageSizeOptions={[10, 30, 50]}
//       defaultPageSize={10}
//       theme="brand"
//     />
//     <Routes>
      
//       <Route path="/super/*" element={<SuperAdminLayout />}>
//         {/* เส้นทางภายใน /super/ ทั้งหมด */}
//         <Route path="*" element={<SuperAdminRoutes />} />
//         </Route>
//       <Route path="/admin/*" element={<AdminLayout />}>
//         {/* เส้นทางภายใน /super/ ทั้งหมด */}
//         <Route path="*" element={<AdminRoutes />} />
//       </Route>
//       <Route path="/member/*" element={<MemberLayout />}>
//             <Route path="*" element={<MemberRoutes />} />
//           </Route>

//       {/* fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;

// import NavbarTourist from "./Components/NavbarTourist"
// import  NavbarSam  from "./Components/NavbarSam"

// function nav_tourist() {
//   return (
//     <>
//       <NavbarTourist />
      
//     </>
//   )
// import React, { useState } from "react";
// import SearchBar from "./Components/Search/SearchBar";
// import SearchBarTable from "./Components/Search/SerachBarTable";

// /*
//  * คำอธิบาย : Component หลักของระบบ สำหรับแสดงหน้า Search ตัวอย่าง
//  * ประกอบด้วย SearchBar (Header) และ SearchBarTable (Table)
//  */

// function App() {
//   const [query, setQuery] = useState("");

//   const searchBar = (value: string) => {
//     console.log("ค้นหาแพ็กเกจกิจกรรม:", value);
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       {/* SearchBarHeader */}
//       <SearchBar
//         onSearch={searchBar}
//         placeholder="ค้นหาแพ็กเกจกิจกรรม:"
//       />
//       {/* SearchBarTable */}
//       <div className="mt-6 w-full max-w-md">
//         <SearchBarTable
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//         />
//       </div>
//     </div>
//   );
// }

// function nav_sam() {
//   return (
//     <>
//       <NavbarSam />
//     </>
  
//   )
// }

// export default  nav_tourist;
// import React, { useState } from "react";
// import Filters from "./Components/Filters";

// function App() {
//   // state เก็บค่าตัวกรองปัจจุบัน
//   const [filter, setFilter] = useState("all");

//   // กำหนดตัวเลือก filter ที่จะส่งไปให้ FilterDropdown
//   const options = [
//     { label: "ทั้งหมด", value: "all" },
//     { label: "สมาชิก", value: "member" },
//     { label: "ผู้ใช้ทั่วไป", value: "guest" },
//   ];

//   // ฟังก์ชันที่ทำงานเมื่อเลือก filter ใหม่
//   const handleFilterChange = (value: string) => {
//     setFilter(value);          // เปลี่ยนค่า state ให้เป็น option ที่เลือก
//     console.log("เลือก:", value); // แสดงใน console
//     // TODO: สามารถเพิ่มโค้ดกรอง array/list ได้ที่นี่
//   };

//   return (
//     <div className="p-6">
//       {/* เรียกใช้ FilterDropdown */}
//       <Filters
//         options={options}          // ส่ง option ทั้งหมด
//         selected={filter}          // ส่งค่าที่เลือกอยู่ปัจจุบัน
//         onChange={handleFilterChange} // ส่งฟังก์ชัน callback
//       />

//       {/* ตัวอย่างการแสดงผลตาม filter */}
//       <div className="mt-4">
//         {filter === "all" && <p>แสดงข้อมูลทั้งหมด</p>}
//         {filter === "member" && <p>แสดงเฉพาะสมาชิก</p>}
//         {filter === "guest" && <p>แสดงเฉพาะผู้ใช้ทั่วไป</p>}
//       </div>
//     </div>
//   );
// }

