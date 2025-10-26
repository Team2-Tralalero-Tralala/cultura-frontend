/**
 * การระงับบัญชี (Super Admin)
 * - แสดงผู้ใช้ที่ถูกระงับ (BLOCKED)
 * - สามารถค้นหา / ยกเลิกการระงับรายบุคคล / ยกเลิกทั้งหมด
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { TrashIcon } from "lucide-react";
import { Modal } from "@/Components/Modal/Modal";

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
} from "@/Services/account-services";

/* ===========================================================
 * ฟังก์ชัน : แปลงชื่อ Role เป็นภาษาไทย
 * =========================================================== */
const thaiRoleName = (role: string): string => {
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

/* ===========================================================
 * คอลัมน์ของตาราง
 * =========================================================== */
const columns: Column<BlockedAccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (r) => (
      <div>{`${r.fname ?? "-"} ${r.lname ?? ""}`.trim() || "-"}</div>
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
 * Component : BlockedAccountPage
 * =========================================================== */
export function BlockedAccountPage() {
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

  /* --------------------------- State สำหรับ Modal --------------------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  /* ===========================================================
   * ฟังก์ชันเปิด Modal
   * =========================================================== */
  function openModal(title: string, text: string, onConfirm: () => void) {
    setModalTitle(title);
    setModalText(text);
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  }

  /* ===========================================================
   * ดึงข้อมูลบัญชีที่ถูกระงับ
   * =========================================================== */
  async function fetchData(): Promise<void> {
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
      console.error("โหลดข้อมูลล้มเหลว:", e);
      setErrorMessage(e.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /* ===========================================================
   * Action ต่อแถว (ยกเลิกการระงับรายบุคคล)
   * =========================================================== */
  const rowActions: DataTableActionsConfig<BlockedAccountRow> = {
    header: "จัดการ",
    align: "right",
    width: "180px",
    variant: "buttons",
    className: "pr-12",
    items: () => ["unblock"],
    callbacks: {
      unblock: (row) => {
        openModal(
          "ยืนยันการยกเลิกการระงับ",
          `คุณต้องการยกเลิกการระงับบัญชี "${row.fname} ${row.lname}" หรือไม่?`,
          async () => {
            await unblockAccountById(row.id);
            await fetchData();
          }
        );
      },
    },
  };

  /* ===========================================================
   * Bulk Actions (ยกเลิกการระงับทั้งหมด)
   * =========================================================== */
  const bulkActions: BulkAction<BlockedAccountRow>[] = [
    {
      id: "bulk-unblock",
      label: "ยกเลิกการระงับทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      onClick: (rows) => {
        openModal(
          "ยืนยันการยกเลิกการระงับทั้งหมด",
          `คุณต้องการยกเลิกการระงับทั้งหมด ${rows.length} รายการหรือไม่?`,
          async () => {
            await unblockMultipleAccounts(rows.map((r) => r.id));
            await fetchData();
          }
        );
      },
    },
  ];

  /* ===========================================================
   * ส่วน UI
   * =========================================================== */
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
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

        <h1 className="text-xl font-semibold text-gray-900">
          การระงับบัญชี
        </h1>

        {/* Search bar */}
        <div className="flex items-center justify-between w-full mt-2">
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

      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* ตารางข้อมูล */}
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

      <Modal
        open={modalOpen}
        title={modalTitle}
        text={modalText}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          onConfirmAction();
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
