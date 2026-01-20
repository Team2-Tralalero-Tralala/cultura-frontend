/**
 * คำอธิบาย: Component สำหรับแสดงรายชื่อผู้ใช้ที่ถูกระงับ (Super Admin) หน้าที่แสดงตารางบัญชีที่ถูกระงับ พร้อมฟังก์ชันค้นหา, ยกเลิกการระงับรายบุคคล, และยกเลิกทั้งหมด
 */
import { useEffect, useState, useMemo } from "react";

import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { TrashIcon } from "lucide-react";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

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
} from "@/Libs/AccountService";

/**
 * คำอธิบาย: แปลงชื่อ Role จากอังกฤษเป็นภาษาไทย
 * Input: role (string) - ชื่อ Role ในภาษาอังกฤษ
 * Output: ชื่อ Role ในภาษาไทย (string)
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
 * คำอธิบาย: กำหนดคอลัมน์ในตารางข้อมูลผู้ใช้ที่ถูกระงับ
 * Input: -
 * Output: Array ของ Column Definition
 */
const columns: Column<BlockedAccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (row) => <div>{`${row.fname ?? "-"} ${row.lname ?? ""}`.trim() || "-"}</div>,
  },
  {
    key: "role",
    header: "ประเภท",
    className: "min-w-[160px]",
    render: (row) => <div>{thaiRoleName(row.role.name)}</div>,
  },
  {
    key: "community",
    header: "ชุมชน",
    className: "min-w-[160px]",
    render: (row) => {
      const adminName = row.communityAdmin?.[0]?.name ?? null;
      const memberName = row.communityMembers?.[0]?.Community?.name ?? null;
      return <div>{adminName || memberName || "-"}</div>;
    },
  },
  {
    key: "email",
    header: "อีเมล",
    className: "min-w-[220px]",
    render: (row) => <div>{row.email ?? "-"}</div>,
  },
];

/**
 * คำอธิบาย: ทำให้ข้อความเป็นตัวพิมพ์เล็กและตัดช่องว่างเพื่อการค้นหา
 * Input: text (string) - ข้อความที่ต้องการ normalize
 * Output: ข้อความที่ normalize แล้ว (string)
 */
const normalizeText = (text: string) =>
  (text ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * คำอธิบาย: หน้าแสดงบัญชีผู้ใช้ที่ถูกระงับ (SuperAdmin)
 * Input: -
 * Output: React Component สำหรับแสดงผลหน้า Blocked Users
 */
export function BlockUserPage() {
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
   * คำอธิบาย: เปิด Modal เพื่อยืนยันการทำงาน
   * Input: title (string) - หัวข้อ Modal, text (string) - เนื้อหา Modal, onConfirm (function) - ฟังก์ชันที่ทำเมื่อยืนยัน
   * Output: - (เซ็ต state เพื่อเปิด Modal)
   */
  function openModal(title: string, text: string, onConfirm: () => void) {
    setModalTitle(title);
    setModalText(text);
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  }

  /**
   * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ที่ถูกระงับจาก API
   * Input: - (ใช้ state ภายใน: pagination)
   * Output: Promise<void> - (อัปเดต state rows และ pagination)
   */
  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchBlockedAccounts(pagination.currentPage, pagination.limit);

      setRows(resultData);
      setPagination(resultPagination);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("โหลดข้อมูลล้มเหลว:", err);
      setErrorMessage(err.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * คำอธิบาย: โหลดข้อมูลเมื่อมีการเปลี่ยนหน้า
   */
  useEffect(() => {
    let isCancelled = false;
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const {
          data: { data: resultData, pagination: resultPagination },
        } = await fetchBlockedAccounts(pagination.currentPage, pagination.limit);

        if (!isCancelled) {
          setRows(resultData);
          setPagination(resultPagination);
        }
      } catch (error) {
        const e = error as Error;
        if (!isCancelled) setErrorMessage(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [pagination.currentPage, pagination.limit]);

  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return rows;

    return rows.filter((row) => {
      const name = `${row.fname ?? ""} ${row.lname ?? ""}`.trim();
      const email = row.email ?? "";
      const role = row.role?.name ?? "";
      const community =
        row.communityAdmin?.[0]?.name ?? row.communityMembers?.[0]?.Community?.name ?? "";

      return (
        normalizeText(name).includes(q) ||
        normalizeText(email).includes(q) ||
        normalizeText(role).includes(q) ||
        normalizeText(community).includes(q)
      );
    });
  }, [rows, searchQuery]);

  /**
   * คำอธิบาย: Action ต่อแถว (ยกเลิกการระงับรายบุคคล)
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
          },
        );
      },
    },
  };

  /**
   * คำอธิบาย: Action หลายแถว (ยกเลิกการระงับทั้งหมด)
   */
  const bulkActions: BulkAction<BlockedAccountRow>[] = [
    {
      id: "bulk-unblock",
      label: "ยกเลิกการระงับทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      onClick: (selectedRows) => {
        openModal(
          "ยืนยันการยกเลิกการระงับทั้งหมด",
          `คุณต้องการยกเลิกการระงับทั้งหมด ${selectedRows.length} รายการหรือไม่?`,
          async () => {
            await unblockMultipleAccounts(selectedRows.map((r) => r.id));
            await fetchData();
          },
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col">
        <div>
          <Breadcrumb
            current={{
              label: "การระงับบัญชี",
              to: "/super/users/blocked",
            }}
          />
        </div>
        <h1 className="text-[20px] font-bold text-black">การระงับบัญชี</h1>

        <div className="flex items-center justify-between w-full mt-2">
          <div className="w-[260px]">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<BlockedAccountRow>
        data={filteredRows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, currentPage: 1, limit }))}
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
