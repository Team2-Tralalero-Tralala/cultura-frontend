// src/Pages/SuperAdmin/ManageCommunitySuperAdmin.tsx
/**
 * จัดการชุมชน (Super Admin หน้าตาราง)
 * - แสดงตารางชุมชน: ชื่อชุมชน / จังหวัด / สถานะ / ผู้ดูแล
 * - ค้นหา + ตัวกรองสถานะ
 * - เลือกหลายแถว, ลบทั้งหมด
 * - ปุ่มแก้ไข/ลบ ต่อแถว
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable from "@/Components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "@/Components/Tables/Types";
import { TrashIcon } from "@/Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SerachBarTable";
import FilterDropdown from "@/Components/Filters";
import { api } from "@/Libs/axios";

import { fetchCommunitiesByRole } from "@/Services/community-services";
import type { CommunityRow } from "@/Types/Community";

// ====== util ======
const normalizeText = (s: string) =>
  (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

// ====== คอลัมน์ตาราง ======
const columns: Column<CommunityRow>[] = [
  {
    key: "name",
    header: "ชื่อชุมชน",
    className: "min-w-[240px]",
    render: (r) => (
      <Link
        to={`/super/community/detail/${r.id}`}
        className="text-dark-green hover:underline font-medium inline-block max-w-full truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {r.name}
      </Link>
    ),
  },
  { key: "province", header: "จังหวัด" },
  {
    key: "status",
    header: "สถานะ",
    render: (r) => (String(r.status).toUpperCase() === "OPEN" ? "เปิด" : "ปิด"),
  },
  { key: "admin", header: "ผู้ดูแล" },
];

// ====== Bulk actions (ลบทั้งหมด) ======
const bulkActions: BulkAction<CommunityRow>[] = [
  {
    id: "bulk-delete",
    label: "ลบทั้งหมด",
    icon: TrashIcon,
    intent: "neutral",
    confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      const ids = rows.map((r) => r.id);
      console.log("bulk delete:", ids);
      // TODO: เรียก API ลบแบบกลุ่ม ถ้ามี endpoint เช่น /super/communities/bulk
    },
  },
];

export default function ManageCommunitySuperAdmin() {
  const navigate = useNavigate();

  // ====== state ตาราง ======
  const [rows, setRows] = useState<CommunityRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ====== ค้นหา + ตัวกรอง ======
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "เปิด", value: "open" },
    { label: "ปิด", value: "closed" },
  ];

  // ====== โหลดข้อมูล ======
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { rows, total } = await fetchCommunitiesByRole("superadmin", currentPage, pageSize);
      setRows(rows);
      setTotalItems(total);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  // เปลี่ยนคำค้น/ตัวกรอง → กลับหน้า 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ====== รวมตัวกรอง: คำค้น + สถานะ ======
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);

    return rows.filter((r) => {
      // 1) ค้นหาจากหลายฟิลด์
      const haystacks = [r.name, r.province, r.admin, r.status].map((v) =>
        normalizeText(String(v ?? ""))
      );
      const passSearch = !q || haystacks.some((h) => h.includes(q));

      // 2) กรองสถานะ
      const s = (r.status ?? "").toString().toUpperCase(); // "OPEN" | "CLOSED"
      const passStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && s === "OPEN") ||
        (statusFilter === "closed" && s === "CLOSED");

      return passSearch && passStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  // ====== การกระทำต่อแถว (แก้ไข/ลบ) ======
  const rowActions: DataTableActionsConfig<CommunityRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/super/community/detail/${row.id}`), // ✅ path ที่ถูก
      delete: async (row) => {
        if (!window.confirm(`ยืนยันลบชุมชน "${row.name}" ?`)) return;
        try {
          // NOTE: สมมติใช้ PATCH ลบแบบ soft-delete เหมือนแพ็กเกจ (เปลี่ยนตาม backend จริง)
          await api.patch(`/super/community/${row.id}`);
          await reload();
        } catch (error: any) {
          console.error(error);
          alert(`ลบไม่สำเร็จ: ${error?.message ?? "unknown error"}`);
        }
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการชุมชน</h1>

        {/* Toolbar: Search + Filter + Add */}
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {/* 🔽 ตัวกรองสถานะ อยู่ "ข้างๆ" searchbar */}
          <FilterDropdown
            options={statusOptions}
            selected={statusFilter}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
          />

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
        pageSizeOptions={[10, 30, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
        // loading={isLoading}
      />
    </div>
  );
}
