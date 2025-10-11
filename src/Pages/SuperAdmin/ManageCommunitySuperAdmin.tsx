// src/Pages/SuperAdmin/ManageCommunitySuperAdmin.tsx
/**
 * จัดการชุมชน (Super Admin)
 * - แสดงตารางชุมชน: ชื่อชุมชน / จังหวัด / สถานะ / ผู้ดูแล
 * - ค้นหา, เลือกหลายแถว, ลบทั้งหมด
 * - ปุ่มแก้ไข/ลบ ต่อแถว
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { api } from "../../Libs/axios";

// 👉 เปลี่ยน service ให้เป็น community
import { fetchCommunitiesByRole } from "../../Services/community-services";

// 👉 ใช้ชนิดข้อมูล CommunityRow (ถ้ายังไม่มี ให้สร้างไฟล์ Types/Community.ts ตามนี้)
// export type CommunityRow = { id:number; name:string; province:string; admin:string; status:string; };
import type { CommunityRow } from "../../Types/Community";

// ====== คอลัมน์ตาราง ======
const columns: Column<CommunityRow>[] = [
  { key: "name", header: "ชื่อชุมชน", className: "min-w-[240px]" },
  { key: "province", header: "จังหวัด" },
  {
    key: "status",
    header: "สถานะ",
    render: (r) => (r.status?.toUpperCase() === "OPEN" ? "เปิด" : "ปิด"),
  },
  { key: "admin", header: "ผู้ดูแล" },
];

// ====== Bulk actions (ลบทั้งหมด) ======
const bulkActions: BulkAction<CommunityRow>[] = [
  {
    id: "bulk-delete",
    label: "ลบทั้งหมด",
    icon: TrashIcon,
    intent: "danger",
    confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      const ids = rows.map((r) => r.id);
      // TODO: เรียก API ลบแบบกลุ่ม ถ้ามี endpoint เช่น /super/communities/bulk
      console.log("bulk delete:", ids);
    },
  },
];

export default function ManageCommunitySuperAdmin() {
  const navigate = useNavigate();

  // ====== state ตาราง ======
  const [rows, setRows] = React.useState<CommunityRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // ====== โหลดข้อมูล ======
  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { rows, total } = await fetchCommunitiesByRole(
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

  React.useEffect(() => {
    reload();
  }, [reload]);

  // ====== การกระทำต่อแถว (แก้ไข/ลบ) ======
  const rowActions: DataTableActionsConfig<CommunityRow> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/super/community/${row.id}`),
        delete: async (row) => {
          if (!window.confirm(`ยืนยันลบชุมชน "${row.name}" ?`)) return;
          try {
            // NOTE: สมมติใช้ PATCH ลบแบบ soft-delete เหมือนแพ็กเกจ
            await api.patch(`/super/community/${row.id}`);
            await reload();
          } catch (error: any) {
            console.error(error);
            alert(`ลบไม่สำเร็จ: ${error?.message ?? "unknown error"}`);
          }
        },
      },
    }),
    [navigate, reload]
  );

  // ====== ค้นหา ======
  const [searchQuery, setSearchQuery] = React.useState("");
  const normalize = (s: string) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

  const statusToText = (s?: string) =>
    (s ?? "").toUpperCase() === "OPEN" ? "เปิด" : "ปิด";

  const filteredRows = React.useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.name,
        r.province,
        r.admin,
        statusToText(r.status),
      ].map(normalize);
      return hay.some((h) => h.includes(q));
    });
  }, [rows, searchQuery]);

  // เปลี่ยนคำค้น → กลับหน้า 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการชุมชน</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto">
            <button
              onClick={() => navigate("/super/community/create")}
              className="inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                         bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
            >
              <span>+ เพิ่มชุมชน</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<CommunityRow>
        data={filteredRows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        striped
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
