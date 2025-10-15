/**
 * คำอธิบาย : ระงับการใช้งาน (Super Admin)
 * หน้านี้ใช้สำหรับแสดงรายชื่อผู้ใช้ที่ถูกระงับการใช้งาน พร้อมฟังก์ชัน:
 * - แสดงตารางข้อมูล: ชื่อบัญชี / บทบาท / ช่องทางติดต่อ
 * - ค้นหา, เลือกหลายแถว, ยกเลิกการระงับหลายรายการ
 * - ปุ่มยกเลิกการระงับ ต่อแถว
 *
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";

// 🧱 Components
import DataTable from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SerachBarTable";

// 🧩 Types & Config
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "../../Components/Tables/Types";
import type { UserRow } from "../../Types/User";

// 🧰 Services & Icons
import { TrashIcon } from "../../Components/Tables/Icon";
import { api, fetchBlockedUsersByRole } from "../../Libs/AccountServices";

/** ===========================================
 * 🧾 การตั้งค่าคอลัมน์ของตาราง (Table Columns)
 * =========================================== */
const columns: Column<UserRow>[] = [
  {
    key: "username",
    header: "ชื่อบัญชี",
    className: "min-w-[200px]",
    render: (row) => (
      <Link
        to={`/super/users/${row.id}`}
        className="text-dark-green hover:underline font-medium inline-block max-w-full truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {row.username}
      </Link>
    ),
  },
  { key: "activityRole", header: "บทบาท", className: "min-w-[200px]" },
  { key: "email", header: "ช่องทางติดต่อ", className: "min-w-[200px]" },
];

/** ===========================================
 * ⚙️ Bulk Actions (ยกเลิกการระงับหลายรายการ)
 * =========================================== */
const bulkActions = (reload: () => Promise<void>): BulkAction<UserRow>[] => [
  {
    id: "bulk-unblock",
    label: "ยกเลิกการระงับทั้งหมด",
    icon: TrashIcon,
    intent: "neutral",
    confirm: (rows) => `ยืนยันยกเลิกการระงับ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      try {
        for (const user of rows) {
          await api.put(`/super/users/unblock/${user.id}`);
        }
        alert("ยกเลิกการระงับสำเร็จ");
        await reload();
      } catch (err: any) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการยกเลิกการระงับ");
      }
    },
  },
];

/** ===========================================
 * 🧠 Page: UserStatusPage
 * =========================================== */
export default function UserStatusPage() {
  /** -------------------------------------------
   * 🎯 ตัวแปร State และ Hook ที่ใช้ภายในหน้า
   * ------------------------------------------- */
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  /** -------------------------------------------
   * 🔄 ฟังก์ชัน reload(): โหลดข้อมูลผู้ใช้ที่ถูกระงับ
   * ------------------------------------------- */
  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { rows, total } = await fetchBlockedUsersByRole(
        "superadmin",
        currentPage,
        pageSize
      );
      setRows(rows);
      setTotalItems(total);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  /** -------------------------------------------
   * 🚀 useEffect - เรียกข้อมูลเมื่อหน้าโหลดหรือเปลี่ยนหน้า
   * ------------------------------------------- */
  React.useEffect(() => {
    reload();
  }, [reload]);

  /** -------------------------------------------
   * 🧰 กำหนด Action ต่อแถว (Row Actions)
   * ------------------------------------------- */
  const rowActions: DataTableActionsConfig<UserRow> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "160px",
      variant: "buttons",
      className: "pr-12", // เว้นขอบขวา 1rem ด้วย Tailwind
      items: () => ["unblock"],
      labels: { unblock: "ยกเลิกการระงับ" },
      callbacks: {
        unblock: async (row) => {
          if (!window.confirm(`ยืนยันยกเลิกการระงับ "${row.username}" ?`))
            return;
          try {
            await api.put(`/super/users/unblock/${row.id}`);
            alert(`ยกเลิกการระงับ "${row.username}" สำเร็จ`);
            await reload();
          } catch (err: any) {
            console.error(err);
            alert("ยกเลิกการระงับไม่สำเร็จ");
          }
        },
      },
    }),
    [navigate, reload]
  );

  /** -------------------------------------------
   * 🔍 ฟังก์ชันค้นหา (Search)
   * ------------------------------------------- */
  const normalize = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  const filteredRows = React.useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [r.username, r.activityRole, r.email].map(normalize);
      return hay.some((h) => h.includes(q));
    });
  }, [rows, searchQuery]);

  /** ===========================================
   * 🎨 ส่วนแสดงผล (UI Layout)
   * =========================================== */
  return (
    <div className="space-y-4">
      {/* 🔹 ส่วนหัวของหน้า */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">
          ระงับการใช้งาน
        </h1>

        {/* 🔍 แถบค้นหาและปุ่มสร้างผู้ใช้ใหม่ */}
        <div className="flex items-center gap-3">
          {/* ช่องค้นหา */}
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ปุ่มสร้างสมาชิก */}
          <div className="ml-auto">
            <button
              onClick={() => navigate("/super/users/create")}
              className="inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                         bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
            >
              + สร้างสมาชิก
            </button>
          </div>
        </div>
      </div>

      {/* 🔴 แสดงข้อความ Error (ถ้ามี) */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* 🧮 ตารางข้อมูลผู้ใช้ที่ถูกระงับ */}
      <DataTable<UserRow>
        data={filteredRows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={rowActions}
        bulkActions={bulkActions(reload)}
        selectable
        striped
        pageSizeOptions={[10, 30, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
