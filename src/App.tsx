/*
* คำอธิบาย : ตัวอย่างการใช้งาน DataTable สำหรับแสดงรายการผู้ใช้
* กำหนดคอลัมน์ ปุ่มจัดการต่อแถว (edit/block/unblock/delete)
* และปุ่มดำเนินการแบบกลุ่ม (bulk delete / bulk unblock) พร้อมข้อมูลจำลอง
*/

import DataTable, { type Column, type DataTableProps } from "./Components/Tables/Index";
import { TrashIcon, BanIcon } from "./Components/Tables/Icon"; 
import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./Page/HomePage";
import React, { useState } from "react";
import SearchBar from "./Components/Search/SearchBar";
import SearchBarTable from "./Components/Search/SerachBarTable";

//ใช้ main.tsx ใช้ route /filters
//ใช้ ./Page/HomePage.tsx แก้ไขข้อมูลใน filters

function App() {
  type Row = { id: number; name: string; role: string; community: string; email: string; suspended?: boolean; };

  const columns: Column<Row>[] = [
    { key: "name", header: "ชื่อ" },
    { key: "role", header: "ประเภท" },
    { key: "community", header: "ชุมชน" },
    { key: "email", header: "อีเมล" },
    
  ];

  const actions: NonNullable<DataTableProps<Row>["actions"]> = {
    header: "จัดการ",
    align: "right",
    width: "200px",
    variant: "icons",
    className: "pr-10",
    items: (r) => ["edit", r.suspended ? "unblock" : "block", "delete"],
    // callbacks: {
    //   edit:    (r) => console.log("edit", r.id),
    //   block:   (r) => console.log("block", r.id),
    //   unblock: (r) => console.log("unblock", r.id),
    //   delete:  (r) => console.log("delete", r.id),
    // },
  };


  const bulkActions: NonNullable<DataTableProps<Row>["bulkActions"]> = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      onClick: async (rows) => {
        const ids = rows.map(r => r.id);
        console.log("bulk delete ids:", ids);
        // ตัวอย่างเชื่อม backend:
        // await fetch("/api/users/bulk-delete", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ids }) });
      
      },   
    },
    {
    id: "bulk-unblock",
    label: "ยกเลิกการระงับทั้งหมด",
    icon: BanIcon,
    intent: "neutral", 
    onClick: async (rows) => {
      const ids = rows.map(r => r.id);
      console.log("bulk unblock ids:", ids);
    },
  },
    
  ];

  const rows = useMemo<Row[]>(
    () => Array.from({ length: 111 }, (_, i) => ({
      id: i + 1,
      name: `ผู้ใช้ ${i + 1}`,
      role: i % 3 === 0 ? "ผู้ดูแลระบบ" : "สมาชิก",
      community: ["บ้านแว้ว", "คลองสระบัว", "สามช่อง"][i % 3],
      email: `user${i + 1}@ex.com`,
      suspended: i % 7 === 0,
    })), []
  );

  return (
    <DataTable<Row>
      data={rows}
      columns={columns}
      getRowKey={(r) => r.id}
      actions={actions}
      bulkActions={bulkActions}      
      pageSizeOptions={[10, 30, 50]}
      defaultPageSize={10}
      theme="brand"
    />
import React, { useState } from "react";
import SearchBar from "./Components/Search/SearchBar";
import SearchBarTable from "./Components/Search/SerachBarTable";

/*
 * คำอธิบาย : Component หลักของระบบ สำหรับแสดงหน้า Search ตัวอย่าง
 * ประกอบด้วย SearchBar (Header) และ SearchBarTable (Table)
 */

function App() {
  const [query, setQuery] = useState("");

  const searchBar = (value: string) => {
    console.log("ค้นหาแพ็กเกจกิจกรรม:", value);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* SearchBarHeader */}
      <SearchBar
        onSearch={searchBar}
        placeholder="ค้นหาแพ็กเกจกิจกรรม:"
      />
      {/* SearchBarTable */}
      <div className="mt-6 w-full max-w-md">
        <SearchBarTable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="/filters" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
