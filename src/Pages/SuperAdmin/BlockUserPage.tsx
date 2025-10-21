/**
 * การระงับบัญชี (Super Admin)
 * - แสดงผู้ใช้ที่ถูกระงับ (BLOCKED)
 * - สามารถค้นหา / ยกเลิกการระงับรายบุคคล / ยกเลิกทั้งหมด
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { TrashIcon } from "@/Components/Tables/Icon";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
  Pagination,
} from "@/Components/Tables/Types";
import type { BlockedAccountRow } from "@/Types/User";
import {
  fetchBlockedAccounts,
  unblockAccountById,
  unblockMultipleAccounts,
} from "@/Libs/AccountServices";

/** ==========================
 * แปลงชื่อ role → ไทย
 * ========================== */
const thaiRoleName = (role: string) => {
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
};

/** ==========================
 * คอลัมน์ของตาราง
 * ========================== */
const columns: Column<BlockedAccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (r) => (
      <div>
        {`${r.fname ?? "-"} ${r.lname ?? ""}`.trim() || "-"}
      </div>
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
 * Component : BlockedAccountSuperAdmin
 * =========================================================== */
export function BlockedAccountSuperAdmin() {
  
  
  const [rows, setRows] = useState<BlockedAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<BlockedAccountRow[]>([]);

  /** ==========================
   * ฟังก์ชัน: fetchData
   * คำอธิบาย: โหลดข้อมูลบัญชีที่ถูกระงับจาก API
   * ========================== */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchBlockedAccounts(
        pagination.currentPage,
        pagination.limit,
        searchQuery
      );
      setRows(resultData);
      setPagination(resultPagination);
    } catch (err: unknown) {
      const e = err as Error;
      console.error("load failed:", e);
      setErrorMessage(e.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /** ==========================
   * Action ต่อแถว
   * ========================== */
  const rowActions: DataTableActionsConfig<BlockedAccountRow> = {
    header: "จัดการ",
    align: "right",
    width: "180px",
    variant: "buttons",
    className: "pr-12",
    items: () => ["unblock"],
    callbacks: {
      unblock: async (row) => {
        if (!window.confirm(`ยืนยันยกเลิกการระงับ "${row.fname} ${row.lname}" ?`))
          return;
        try {
          await unblockAccountById(row.id);
          alert("ยกเลิกการระงับสำเร็จ");
          await fetchData();
        } catch (err: unknown) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการยกเลิกการระงับ");
        }
      },
    },
  };

  /** ==========================
   * Bulk Actions
   * ========================== */
  const bulkActions: BulkAction<BlockedAccountRow>[] = [
    {
      id: "bulk-unblock",
      label: "ยกเลิกการระงับทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) =>
        `ยืนยันยกเลิกการระงับ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        try {
          await unblockMultipleAccounts(rows.map((r) => r.id));
          alert("ยกเลิกการระงับสำเร็จ");
          await fetchData();
        } catch (err: unknown) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการยกเลิกการระงับทั้งหมด");
        }
      },
    },
  ];

  /** ==========================
   * ส่วน UI
   * ========================== */
  return (
    <div className="space-y-4">
      {/* ส่วนหัวของหน้า */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          <Link
            to="/super/accounts"
            className="text-gray-900 hover:underline font-medium"
          >
            จัดการบัญชี
          </Link>
          <span className="mx-1 text-gray-500">&gt;</span>
          <span>การระงับบัญชี</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900">การระงับบัญชี</h1>

        {/* แถวค้นหา */}
        <div className="flex items-center justify-between w-full mt-2">
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
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* ตาราง */}
      <DataTable<BlockedAccountRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(p) =>
          setPagination((prev) => ({ ...prev, currentPage: p }))
        }
        onPageSizeChange={(p) =>
          setPagination((prev) => ({ ...prev, currentPage: 1, limit: p }))
        }
        onSelectedChange={(rows) => setSelectedRows(rows)}
        isLoading={isLoading}
        actions={rowActions}
        bulkActions={bulkActions}
      />
    </div>
  );
}
