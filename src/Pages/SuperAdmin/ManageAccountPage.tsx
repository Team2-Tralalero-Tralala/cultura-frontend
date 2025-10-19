/**
 * จัดการบัญชี (Super Admin)
 * - แสดงตารางบัญชีผู้ใช้: ชื่อจริง-นามสกุล / ประเภท / ชุมชน / อีเมล
 * - ค้นหา + ตัวกรองประเภท
 * - เลือกหลายแถว / ลบหลายรายการ / ระงับหลายรายการ
 * - ปุ่มระงับ / แก้ไข / ลบ ต่อแถว
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { TrashIcon, BanIcon } from "lucide-react"; // 🔒 icon สำหรับ Block

import type {
  Column,
  DataTableActionsConfig,
  Pagination,
  BulkAction,
} from "@/Components/Tables/Types";
import type { AccountRow } from "@/Types/User";

import {
  fetchAccounts,
  blockAccountById,
  blockMultipleAccounts,
} from "@/Libs/AccountServices";

/* 🧩 แปลงชื่อ role เป็นภาษาไทย */
const thaiRoleName = (role: string) => {
  switch (role) {
    case "admin":
      return "ผู้ดูแลระบบ";
    case "member":
      return "สมาชิก";
    case "tourist":
      return "ผู้ใช้งานทั่วไป";
    default:
      return role;
  }
};

/* ====== คอลัมน์ตาราง ====== */
const columns: Column<AccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (r) => (
      <Link
        to={`/super/users/${r.id}`} // 🔗 ลิงก์ไปหน้าแสดงรายละเอียดผู้ใช้
        onClick={(e) => e.stopPropagation()}
        className="text-[#4A816F] hover:underline"
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

export default function ManageAccountPage() {
  // ====== state ตาราง ======
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedRows, setSelectedRows] = useState<AccountRow[]>([]);

  // ====== ตัวเลือกกรองประเภท ======
  const optionsRole = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ผู้ดูแลระบบ", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้งานทั่วไป", value: "tourist" },
  ];

  /* ===== โหลดข้อมูล ===== */
  const fetchData = async () => {
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
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setErrorMessage(err?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery, filterRole]);

  /* ===== Action ต่อแถว ===== */
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
      edit: (row) => alert(`แก้ไขผู้ใช้ ID: ${row.id}`),
      delete: async (row) => {
        if (!window.confirm(`ยืนยันลบ "${row.fname} ${row.lname}" ?`)) return;
        alert("ลบผู้ใช้สำเร็จ (mock)");
        await fetchData();
      },
    },
  };

  /* ===== Action หลายแถว ===== */
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
        alert("bulk delete: " + rows.map((r) => r.id).join(", "));
        await fetchData();
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Header Section ===== */}
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sm text-gray-500">จัดการบัญชี</h2>
        <h1 className="text-xl font-semibold">จัดการบัญชีผู้ใช้</h1>

        <div className="flex items-center justify-between w-full mt-2">
          {/* กล่องซ้าย : search + filter */}
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
            className="top-6 right-6 flex items-center gap-3 bg-[#104E41] hover:bg-[#0b3a30] text-white px-4 py-3 rounded-xl transition text-base font-medium"
          >
            <span className="text-lg leading-none">＋</span>
            <span>เพิ่มบัญชี</span>
          </button>
        </div>
      </div>

      {/* ===== แสดงข้อความ Error ===== */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* ===== Table Section ===== */}
      <DataTable<AccountRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable={true}
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
