/**
 * Component: ManageAccountPage (Super Admin)
 * Description: หน้าจัดการบัญชีผู้ใช้ (Super Admin)
 * - แสดงตารางบัญชีผู้ใช้
 * - มีฟังก์ชันค้นหา / กรอง / เพิ่ม / ระงับ / ลบ / ระงับทั้งหมด / ลบทั้งหมด
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon, BanIcon } from "lucide-react";

// Components
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { Modal } from "@/Components/Modal/Modal";

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
} from "@/Services/account-services";
import Button from "@/Components/Button";

/**
 * ฟังก์ชัน: thaiRoleName
 * วัตถุประสงค์: แปลงชื่อ Role จากอังกฤษเป็นภาษาไทย
 * Input: role (string)
 * Output: ชื่อ Role ภาษาไทย (string)
 */
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

/**
 * ตัวแปร: columns
 * วัตถุประสงค์: กำหนดคอลัมน์ในตารางบัญชีผู้ใช้
 */
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
 * Component: ManageAccountPage
 * วัตถุประสงค์: แสดงตารางบัญชีผู้ใช้ (SuperAdmin)
 */
export function ManageAccountPage() {
  const navigate = useNavigate();

  // Section: State หลัก
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

  // Section: State สำหรับ Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  /**
   * ฟังก์ชัน: openModal
   * วัตถุประสงค์: เปิด Modal ยืนยันการทำงาน
   * Input: title, text, onConfirm callback
   * Output: แสดง Modal พร้อมข้อมูล
   */
  function openModal(title: string, text: string, onConfirm: () => void) {
    setModalTitle(title);
    setModalText(text);
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  }

  /**
   * ตัวเลือกกรองประเภทผู้ใช้
   */
  const optionsRole = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ผู้ดูแลระบบ", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้งานทั่วไป", value: "tourist" },
  ];

  /**
   * ฟังก์ชัน: fetchData
   * วัตถุประสงค์: ดึงข้อมูลบัญชีผู้ใช้ทั้งหมดจาก API
   * Input: ไม่มี (อ้างอิง pagination, searchQuery, filterRole)
   * Output: เซตข้อมูลบัญชีผู้ใช้ใน state rows
   */
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

  /**
   * useEffect: โหลดข้อมูลเมื่อเปลี่ยนหน้า / ค้นหา / กรอง
   */
  useEffect(() => {
    let isCancelled = false;
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const {
          data: { data: resultData, pagination: resultPagination },
        } = await fetchAccounts(
          pagination.currentPage,
          pagination.limit,
          searchQuery,
          filterRole === "all" ? undefined : filterRole
        );

        if (!isCancelled) {
          setRows(resultData);
          setPagination(resultPagination);
        }
      } catch (err) {
        const e = err as Error;
        if (!isCancelled) setErrorMessage(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [pagination.currentPage, pagination.limit, searchQuery, filterRole]);

  /**
   * ฟังก์ชัน: rowActions
   * วัตถุประสงค์: จัดการ Action ต่อแถว (ระงับ / ลบ / แก้ไข)
   * Input: row (AccountRow)
   * Output: เปิด Modal หรือเปลี่ยนหน้า
   */
  const rowActions: DataTableActionsConfig<AccountRow> = {
    header: "จัดการ",
    align: "right",
    width: "180px",
    variant: "icons",
    className: "pr-11",
    items: () => ["block", "edit", "delete"],
    callbacks: {
      block: (row) => {
        openModal(
          "ยืนยันระงับบัญชีผู้ใช้",
          `คุณต้องการยืนยันการระงับบัญชี "${row.fname} ${row.lname}" หรือไม่?`,
          async () => {
            await blockAccountById(row.id);
            await fetchData();
          }
        );
      },
      edit: (row) => navigate(`/super/account/edit/${row.id}`),
      delete: (row) => {
        openModal(
          "ยืนยันการลบบัญชี",
          `คุณต้องการยืนยันการลบบัญชี "${row.fname} ${row.lname}" หรือไม่?`,
          async () => {
            await deleteAccountById(row.id);
            await fetchData();
          }
        );
      },
    },
  };

  /**
   * ฟังก์ชัน: bulkActions
   * วัตถุประสงค์: จัดการ Action หลายแถว (ระงับทั้งหมด / ลบทั้งหมด)
   * Input: rows (AccountRow[])
   * Output: เรียก API หลายรายการ
   */
  const bulkActions: BulkAction<AccountRow>[] = [
    {
      id: "bulk-block",
      label: "ระงับทั้งหมด",
      icon: BanIcon,
      intent: "neutral",
      onClick: (rows) => {
        openModal(
          "ยืนยันระงับบัญชีผู้ใช้",
          `คุณต้องการระงับบัญชีทั้งหมด ${rows.length} รายการหรือไม่?`,
          async () => {
            await blockMultipleAccounts(rows.map((r) => r.id));
            await fetchData();
          }
        );
      },
    },
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      onClick: (rows) => {
        openModal(
          "ยืนยันการลบบัญชี",
          `คุณต้องการลบบัญชีทั้งหมด ${rows.length} รายการหรือไม่?`,
          async () => {
            await deleteMultipleAccounts(rows.map((r) => r.id));
            await fetchData();
          }
        );
      },
    },
  ];

  // Section: Render Layout
  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sm text-gray-500">จัดการบัญชี</h2>
        <h1 className="text-xl font-semibold">จัดการบัญชีผู้ใช้</h1>

        <div className="flex items-center justify-between w-full mt-2">
          {/* Section: Search + Filter */}
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

          {/* Section: Add Account */}
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/super/account/admin/create")}>
              <span className="text-lg leading-none">＋</span>
              <span>เพิ่มบัญชี</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Error */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Section: Table */}
      <DataTable<AccountRow>
        data={rows}
        getKey={(row) => row.id.toString()}
        columns={columns}
        selectable={true}
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, currentPage: 1, limit }))}
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
