/**
 * Component : ManageAccountPage (Super Admin)
 * Description : หน้าจัดการบัญชีผู้ใช้ (Super Admin)
 * - แสดงตารางบัญชีผู้ใช้: ชื่อจริง-นามสกุล / ประเภท / ชุมชน / อีเมล
 * - ค้นหา + ตัวกรองประเภท
 * - เลือกหลายแถว / ลบหลายรายการ / ระงับหลายรายการ
 * - ปุ่มระงับ / แก้ไข / ลบ ต่อแถว
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon, BanIcon } from "lucide-react";

// Components
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";

// Types
import type {
  Column,
  DataTableActionsConfig,
  Pagination,
  BulkAction,
} from "@/Components/Tables/Types";
import type { AccountRow } from "@/Types/User";

// Services
import {
  fetchAccounts,
  blockAccountById,
  blockMultipleAccounts,
  deleteAccountById,
  deleteMultipleAccounts,
} from "@/Libs/AccountServices";

/* ===========================================================
 * Function : thaiRoleName
 * Description : แปลงชื่อ Role เป็นภาษาไทย
 * =========================================================== */
function thaiRoleName(role: string): string {
  switch (role) {
    case "superadmin":
      return "ผู้ดูแลระบบ";
    case "admin":
      return "ผู้ดูแลชุมชน";
    case "member":
      return "สมาชิก";
    case "tourist":
      return "ผู้ใช้งานทั่วไป";
    default:
      return role;
  }
}

/* ===========================================================
 * Variable : columns (คอลัมน์ของตาราง)
 * =========================================================== */
const columns: Column<AccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (r) => (
      <Link
        to={`/super/users/${r.id}`}
        onClick={(e) => e.stopPropagation()}
        className="hover:underline"
      >
        {`${r.fname ?? "-"} ${r.lname ?? ""}`.trim() || "-"}
      </Link>
    ),
  },
  {
    key: "role",
    header: "ประเภท",
    className: "min-w-[160px]",
    render: (r) => <div>{thaiRoleName(r.role.name)}</div>,
  },
  {
    key: "memberOf",
    header: "ชุมชน",
    className: "min-w-[160px]",
    render: (r) => <div>{r.memberOf?.name ?? "-"}</div>,
  },
  {
    key: "email",
    header: "อีเมล",
    className: "min-w-[220px]",
    render: (r) => <div>{r.email ?? "-"}</div>,
  },
];

/* ===========================================================
 * Component : ManageAccountPage
 * =========================================================== */
export function ManageAccountPage() {
  const navigate = useNavigate();

  /* ===========================================================
   * State : จัดการข้อมูลของตาราง
   * =========================================================== */
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<AccountRow[]>([]);

  /* ===========================================================
   * Variable : ตัวเลือกตัวกรองประเภทผู้ใช้
   * =========================================================== */
  const optionsRole = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ผู้ดูแลระบบ", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้งานทั่วไป", value: "tourist" },
  ];

  /* ===========================================================
   * Function : fetchData
   * Description : ดึงข้อมูลบัญชีผู้ใช้จาก API
   * =========================================================== */
  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchAccounts(
        pagination.currentPage,
        pagination.limit,
        searchQuery,
        filterRole === "all" ? undefined : filterRole
      );

      setRows(resultData);
      setPagination(resultPagination);
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Fetch failed:", e);
      setErrorMessage(e.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  // โหลดข้อมูลทุกครั้งที่มีการเปลี่ยนหน้า / เงื่อนไขค้นหา / กรอง
  useEffect(() => {
    void fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery, filterRole]);

  /* ===========================================================
   * Config : Action ต่อแถว
   * =========================================================== */
  const rowActions: DataTableActionsConfig<AccountRow> = {
    header: "จัดการ",
    align: "right",
    width: "180px",
    variant: "icons",
    className: "pr-11",
    items: () => ["block", "edit", "delete"],
    callbacks: {
      block: async (row) => {
        if (!window.confirm(`ยืนยันระงับบัญชี "${row.fname} ${row.lname}" ?`)) return;
        await blockAccountById(row.id);
        alert("ระงับบัญชีสำเร็จ");
        await fetchData();
      },
      edit: (row) => {
        navigate(`/super/account/edit/${row.id}`);
      },
      delete: async (row) => {
        if (!window.confirm(`ยืนยันลบบัญชี "${row.fname} ${row.lname}" ?`)) return;
        await deleteAccountById(row.id);
        alert("ลบบัญชีสำเร็จ");
        await fetchData();
      },
    },
  };

  /* ===========================================================
   * Config : Action หลายแถว
   * =========================================================== */
  const bulkActions: BulkAction<AccountRow>[] = [
    {
      id: "bulk-block",
      label: "ระงับทั้งหมด",
      icon: BanIcon,
      intent: "warning",
      confirm: (rows) => `ยืนยันระงับบัญชีทั้งหมด ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        await blockMultipleAccounts(rows.map((r) => r.id));
        alert("ระงับบัญชีสำเร็จ");
        await fetchData();
      },
    },
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        await deleteMultipleAccounts(rows.map((r) => r.id));
        alert("ลบบัญชีทั้งหมดสำเร็จ");
        await fetchData();
      },
    },
  ];

  /* ===========================================================
   * Return : UI หลักของหน้า
   * =========================================================== */
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sm text-gray-500">จัดการบัญชี</h2>
        <h1 className="text-xl font-semibold">จัดการบัญชีผู้ใช้</h1>

        <div className="flex items-center justify-between w-full mt-2">
          {/* ช่องค้นหา + ตัวกรอง */}
          <div className="flex items-center gap-2">
            <div className="w-[260px]">
              <SearchBarTable
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              />
            </div>

            <div className="w-[140px]">
              <FiltersForCM
                options={optionsRole}
                selected={filterRole}
                onChange={(value) => {
                  setFilterRole(value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              />
            </div>
          </div>

          {/* ปุ่มเพิ่มบัญชี */}
          <button
            onClick={() => navigate("/super/account/create")}
            className="flex items-center gap-3 bg-[#104E41] hover:bg-[#0b3a30] text-white px-4 py-3 rounded-xl transition text-base font-medium"
          >
            <span className="text-lg leading-none">＋</span>
            <span>เพิ่มบัญชี</span>
          </button>
        </div>
      </div>

      {/* แสดงข้อความ Error */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Table Section */}
      <DataTable<AccountRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable={true}
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, currentPage: p }))}
        onPageSizeChange={(p) => setPagination((prev) => ({ ...prev, currentPage: 1, limit: p }))}
        onSelectedChange={(rows) => setSelectedRows(rows)}
        isLoading={isLoading}
        actions={rowActions}
        bulkActions={bulkActions}
      />
    </div>
  );
}
