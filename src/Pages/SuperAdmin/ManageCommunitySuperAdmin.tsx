/**
 * จัดการชุมชน (Super Admin)
 * - แสดงตารางชุมชน: ชื่อชุมชน / จังหวัด / สถานะ / ผู้ดูแล
 * - ค้นหา + ตัวกรองสถานะ
 * - เลือกหลายแถว, ลบทั้งหมด
 * - ปุ่มแก้ไข/ลบ ต่อแถว
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// 1) จัดกลุ่ม import: UI Components -> Types -> Libs
import DataTable from "@/Components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "@/Components/Tables/Types";
import { TrashIcon } from "@/Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";

import type { CommunityRow } from "@/Types/Community";
import { getCommunities, deleteCommunity } from "@/Libs/CommunityService";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";

// ================= Utility =================
// (แนะนำ) ถ้ามีใช้ซ้ำหลายหน้า ควรย้ายไป utils/string.ts แล้ว import มาใช้
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

// ================= Types =================
// ✅ สร้าง type สำหรับข้อมูลที่มาจาก API แทน any
type ApiCommunity = {
  id: number;
  name?: string | null;
  status?: "OPEN" | "CLOSED" | string | null;
  location?: { province?: string | null } | null;
  admin?: { fname?: string | null; lname?: string | null } | null;
};

// ✅ แยกชนิดตัวกรอง สะอาดและปลอดภัยกว่า cast
type StatusFilter = "all" | "open" | "closed";

// ================= คอลัมน์ตาราง =================
const columns: Column<CommunityRow>[] = [
  {
    key: "name",
    header: "ชื่อชุมชน",
    className: "min-w-[240px]",
    // ✅ ใช้ชื่อแปร row เพื่ออ่านง่ายตอนรีวิว
    render: (row) => (
      <Link
        to={`/super/community/detail/${row.id}`}
        className="text-dark-green hover:underline font-medium inline-block max-w-full truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {row.name}
      </Link>
    ),
  },
  { key: "province", header: "จังหวัด" },
  {
    key: "status",
    header: "สถานะ",
    render: (row) =>
      String(row.status).toUpperCase() === "OPEN" ? "เปิด" : "ปิด",
  },
  { key: "admin", header: "ผู้ดูแล" },
];

// ================= Bulk Actions =================
const bulkActions: BulkAction<CommunityRow>[] = [
  {
    id: "bulk-delete",
    label: "ลบทั้งหมด",
    icon: TrashIcon,
    intent: "neutral",
    confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      const ids = rows.map((row) => row.id);
      console.log("bulk delete:", ids);
      // TODO: endpoint ลบแบบกลุ่มถ้ามี
    },
  },
];

const handleDelete = async (communityId: number) => {
  await deleteCommunity(Number(communityId));
};
// ================= Component =================
export default function ManageCommunitySuperAdmin() {
  const navigate = useNavigate();

  // ====== State ======
  const [rows, setRows] = useState<CommunityRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ====== ค้นหา + ตัวกรอง ======
  const [searchQuery, setSearchQuery] = useState("");
  // ✅ ใช้ชนิด StatusFilter ชัดเจน
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // ✅ ทำ options เป็น const เพื่อให้ type inference ชัด และไม่ re-create ทุก render
  const statusOptions = useMemo(
    () =>
      [
        { label: "ทั้งหมด", value: "all" },
        { label: "เปิด", value: "open" },
        { label: "ปิด", value: "closed" },
      ] as const,
    []
  );

  // ====== โหลดข้อมูลจาก API ======
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getCommunities(currentPage, pageSize);
      const payload = res.data?.data;

      // ดึง array ออกมา
      const list: ApiCommunity[] = Array.isArray(payload?.data)
        ? payload.data
        : [];
      const pg = payload?.pagination ?? {};

      // map ให้ตรงกับ type CommunityRow
      const mapped: CommunityRow[] = list.map((c) => ({
        id: c.id,
        name: c.name ?? "-",
        province: c.location?.province ?? "-",
        status: c.status ?? "CLOSED",
        admin: c.admin
          ? `${c.admin.fname ?? ""} ${c.admin.lname ?? ""}`.trim()
          : "-",
      }));

      setRows(mapped);
      setTotalItems(pg?.totalCount ?? mapped.length);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ====== ถ้ามีการเปลี่ยน search หรือ filter → กลับหน้า 1 ======
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ====== กรองข้อมูลก่อนแสดง ======
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);

    return rows.filter((row) => {
      // ค้นหาจากหลายฟิลด์
      const haystacks = [row.name, row.province, row.admin, row.status].map(
        (v) => normalizeText(String(v ?? ""))
      );
      const passSearch = !q || haystacks.some((h) => h.includes(q));

      // กรองสถานะ
      const s = (row.status ?? "").toString().toUpperCase();
      const passStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && s === "OPEN") ||
        (statusFilter === "closed" && s === "CLOSED");

      return passSearch && passStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  // ====== Actions ต่อแถว ======
  const rowActions: DataTableActionsConfig<CommunityRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    className: "pr-6", //เอาไว้ขยับ "จัดการ" ให้สวยๆ
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/super/community/edit/${row.id}`),
      delete: async (row) => {
        setDeleteId(row.id);
        setOpenConfirm(true);
      },
    },
  };

  // ================= Render =================
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">จัดการชุมชน</h1>

        {/* Toolbar: Search + Filter + Add */}
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter (อยู่ขวาของ search) */}
          <FilterDropdown
            options={
              statusOptions as unknown as { label: string; value: string }[]
            }
            selected={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
          />

          <div className="ml-auto">
            <Button
              onClick={() => navigate("/super/community/create")}
              // (แนะนำ) ถ้ามี theme ให้ใช้คลาสแบรนด์แทน hex
              aria-label="เพิ่มชุมชนใหม่"
            >
              <span>+ เพิ่มชุมชน</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* Table */}
      <DataTable<CommunityRow>
        data={filteredRows}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        striped
        pageSizeOptions={[10, 30, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
      <Modal
        open={openConfirm}
        title="ยืนยันการลบชุมชน"
        text="คุณต้องการยืนยันการลบชุมชนหรือไม่"
        onConfirm={async () => {
          if (deleteId == null) return;
          try {
            await handleDelete(deleteId);
            await reload();
          } catch (error: any) {
            console.error(error);
            alert(
              `ลบไม่สำเร็จ: ${
                error?.response?.data?.message ??
                error?.message ??
                "unknown error"
              }`
            );
          } finally {
            setOpenConfirm(false);
            setDeleteId(null);
          }
        }}
        onCancel={() => {
          setOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
