/**
 * หน้า "ประวัติการจอง" ของแอดมิน (ยังไม่ดึง API)
 */

import React from "react";
import DataTable from "../../Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import SearchBarTable from "../../Components/Search/SerachBarTable";

type BookingRow = {
  id: string;
  bookingCode: string;
  packageTitle: string;
  memberName: string;
  phone?: string;
  bookedAt: string;
  statusText: string;
  amount: number;
  paid: boolean;
};

const columns: Column<BookingRow>[] = [
  { key: "bookingCode", header: "รหัสจอง", className: "min-w-[140px]" },
  { key: "packageTitle", header: "ชื่อแพ็กเกจ", className: "min-w-[220px]" },
  { key: "memberName", header: "ผู้จอง", className: "min-w-[180px]" },
  { key: "phone", header: "โทรศัพท์", render: (r) => r.phone ?? "-" },
  { key: "bookedAt", header: "วันที่จอง", render: (r) => new Date(r.bookedAt).toLocaleString() },
  { key: "statusText", header: "สถานะ" },
  { key: "amount", header: "ยอดรวม (฿)", render: (r) => r.amount.toLocaleString() },
  { key: "paid", header: "ชำระเงิน", render: (r) => (r.paid ? "ชำระแล้ว" : "ยังไม่ชำระ") },
];

export default function BookingHistoryAdmin() {
  const [tableRows] = React.useState<BookingRow[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">ประวัติการจอง (แอดมิน)</h1>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DataTable<BookingRow>
        data={tableRows}
        columns={columns}
        getRowKey={(r) => r.id}
        selectable={false}
        striped
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={10}
     
        theme="brand"
        className="bg-white rounded-lg"
      
      />

      {tableRows.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-6">
          ยังไม่มีข้อมูลการจองในระบบ
        </div>
      )}
    </div>
  );
}
