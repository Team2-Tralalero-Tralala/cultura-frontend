/**
 * Component: BlockedAccountPage (Super Admin)
 * Description:
 * - แสดงรายชื่อผู้ใช้ที่ถูกระงับ (BLOCKED)
 * - สามารถค้นหา / ยกเลิกการระงับรายบุคคล / ยกเลิกการระงับทั้งหมด
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

/**
 * ฟังก์ชัน: thaiRoleName
 * วัตถุประสงค์: แปลงชื่อ Role จากอังกฤษเป็นภาษาไทย
 * Input: role (string)
 * Output: ชื่อ Role ภาษาไทย
 */
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

/**
 * ตัวแปร: columns
 * วัตถุประสงค์: กำหนดคอลัมน์ในตารางข้อมูลผู้ใช้ที่ถูกระงับ
 */
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
    key: "community",
    header: "ชุมชน",
    className: "min-w-[160px]",
    render: (r) => {
      const adminName = r.communityAdmin?.[0]?.name ?? null;
      const memberName = r.communityMembers?.[0]?.Community?.name ?? null;
      return <div>{adminName || memberName || "-"}</div>;
    },
  },
  {
    key: "email",
    header: "อีเมล",
    className: "min-w-[220px]",
    render: (r) => <div>{r.email ?? "-"}</div>,
  },
];

/**
 * Component: BlockedAccountPage
 * วัตถุประสงค์: แสดงบัญชีผู้ใช้ที่ถูกระงับ (SuperAdmin)
 */
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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  /**
   * ฟังก์ชัน: openModal
   * วัตถุประสงค์: เปิด Modal เพื่อยืนยันการทำงาน
   * Input: title (string), text (string), onConfirm (callback)
   * Output: แสดง Modal บนหน้าจอ
   */
  function openModal(title: string, text: string, onConfirm: () => void) {
    setModalTitle(title);
    setModalText(text);
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  }

  /**
   * ฟังก์ชัน: fetchData
   * วัตถุประสงค์: ดึงข้อมูลบัญชีผู้ใช้ที่ถูกระงับจาก API
   * Input: pagination, searchQuery
   * Output: เซตข้อมูลบัญชีใน state rows
   */
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

  /**
   * useEffect: โหลดข้อมูลเมื่อมีการเปลี่ยนแปลง pagination หรือ searchQuery
   */
  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /**
   * ฟังก์ชัน: rowActions
   * วัตถุประสงค์: Action ต่อแถว (ยกเลิกการระงับรายบุคคล)
   * Input: row (BlockedAccountRow)
   * Output: เปิด Modal และดำเนินการยกเลิกการระงับ
   */
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

  /**
   * ฟังก์ชัน: bulkActions
   * วัตถุประสงค์: Action หลายแถว (ยกเลิกการระงับทั้งหมด)
   * Input: rows (BlockedAccountRow[])
   * Output: เรียก API เพื่อยกเลิกการระงับทั้งหมด
   */
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

  // Section: Render
  return (
    <div className="space-y-4">
      {/* Section: Header */}
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

        {/* Section: Search bar */}
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

      {/* Section: Error */}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* Section: Table */}
      <DataTable<BlockedAccountRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        onPageSizeChange={(limit) =>
          setPagination((prev) => ({ ...prev, currentPage: 1, limit }))
        }
        onSelectedChange={(rows) => setSelectedRows(rows)}
        isLoading={isLoading}
        actions={rowActions}
        bulkActions={bulkActions}
      />

      {/* Section: Modal */}
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
