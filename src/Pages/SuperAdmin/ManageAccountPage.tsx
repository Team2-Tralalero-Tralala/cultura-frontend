/**
 * คำอธิบาย: หน้าจัดการบัญชีผู้ใช้ (Super Admin)

 */

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon, BanIcon } from "lucide-react";

// Components
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { Modal } from "@/Components/Modal/Modal";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

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
} from "@/Libs/AccountService";

/**
 * คำอธิบาย: แปลงชื่อ Role จากอังกฤษเป็นภาษาไทย
 * Input: role - ชื่อ role เป็นภาษาอังกฤษ
 * Output: ชื่อ role เป็นภาษาไทย
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
 * คำอธิบาย: กำหนดคอลัมน์ในตารางบัญชีผู้ใช้
 */
const columns: Column<AccountRow>[] = [
  {
    key: "fullname",
    header: "ชื่อจริง-นามสกุล",
    className: "min-w-[240px]",
    render: (object) => (
      <Link
        to={`/super/account/${object.id}`}
        onClick={(event) => event.stopPropagation()}
        className="hover:underline"
      >
        {`${object.fname ?? "-"} ${object.lname ?? ""}`.trim() || "-"}
      </Link>
    ),
  },
  {
    key: "role",
    header: "ประเภท",
    className: "min-w-[160px]",
    render: (object) => <div>{thaiRoleName(object.role.name)}</div>,
  },
  {
    key: "community",
    header: "ชุมชน",
    className: "min-w-[160px]",
    render: (object) => {
      const adminName = object.communityAdmin?.[0]?.name ?? null;
      const memberName = object.communityMembers?.[0]?.Community?.name ?? null;
      return <div>{adminName || memberName || "-"}</div>;
    },
  },
  {
    key: "email",
    header: "อีเมล",
    className: "min-w-[220px]",
    render: (object) => <div>{object.email ?? "-"}</div>,
  },
];

/**
 * คำอธิบาย: ทำให้ค้นหาไม่สนพิมพ์เล็ก/ใหญ่ และช่องว่างเกิน
 * Input: text - ข้อความที่ต้องการแปลง
 * Output: ข้อความที่แปลงแล้ว (ตัวพิมพ์เล็ก, ตัดช่องว่าง)
 */
const normalizeText = (text: string) =>
  (text ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * คำอธิบาย: Component สำหรับจัดการบัญชีผู้ใช้ของ Super Admin
 * Input: -
 * Output: JSX Element หน้า ManageAccountPage
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  /**
   * คำอธิบาย: เปิด Modal ยืนยันการทำงาน
   * Input: title (หัวข้อ), text (ข้อความ), onConfirm (action เมื่อยืนยัน)
   * Output: -
   */
  function openModal(title: string, text: string, onConfirm: () => void) {
    setModalTitle(title);
    setModalText(text);
    setOnConfirmAction(() => onConfirm);
    setIsModalOpen(true);
  }

  /**
   * ตัวเลือกกรองประเภทผู้ใช้
   */
  const optionsRole = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ผู้ดูแลชุมชน", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้งานทั่วไป", value: "tourist" },
  ];

  /**
   * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ทั้งหมดจาก API
   * Input: - (ใช้ pagination.currentPage, pagination.limit จาก state)
   * Output: -
   */
  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchAccounts(pagination.currentPage, pagination.limit);

      setRows(resultData);
      setPagination(resultPagination);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Fetch failed:", error);
      setErrorMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * คำอธิบาย: Effect สำหรับโหลดข้อมูลเมื่อเปลี่ยนหน้า (pagination)
   * Input: -
   * Output: -
   */
  useEffect(() => {
    let isCancelled = false;
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const {
          data: { data: resultData, pagination: resultPagination },
        } = await fetchAccounts(pagination.currentPage, pagination.limit);

        if (!isCancelled) {
          setRows(resultData);
          setPagination(resultPagination);
        }
      } catch (err) {
        const error = err as Error;
        if (!isCancelled) setErrorMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [pagination.currentPage, pagination.limit]);

  /**
   * คำอธิบาย: ส่วนกรองข้อมูลสำหรับ Search + Filter (frontend)
   * Input: -
   * Output: -
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);
    const selectedRole = filterRole.toLowerCase();

    return rows.filter((object) => {
      // กรอง role
      const role = object.role?.name?.toLowerCase() ?? "";
      const passRole = selectedRole === "all" || role === selectedRole;

      // กรอง search
      const name = `${object.fname ?? ""} ${object.lname ?? ""}`.trim();
      const email = object.email ?? "";
      const community =
        object.communityAdmin?.[0]?.name ?? object.communityMembers?.[0]?.Community?.name ?? "";

      const textMatch =
        !query ||
        normalizeText(name).includes(query) ||
        normalizeText(email).includes(query) ||
        normalizeText(role).includes(query) ||
        normalizeText(community).includes(query);

      return passRole && textMatch;
    });
  }, [rows, searchQuery, filterRole]);

  /**
   * คำอธิบาย: กำหนด Action สำหรับแต่ละแถวในตาราง (Block, Edit, Delete)
   * Input: -
   * Output: -
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
          },
        );
      },
      edit: (row) => navigate(`/super/account/${row.role.name}/${row.id}/edit`),
      delete: (row) => {
        openModal(
          "ยืนยันการลบบัญชี",
          `คุณต้องการยืนยันการลบบัญชี "${row.fname} ${row.lname}" หรือไม่?`,
          async () => {
            await deleteAccountById(row.id);
            await fetchData();
          },
        );
      },
    },
  };

  /**
   * คำอธิบาย: กำหนด Bulk Actions สำหรับหลายแถว (Block All, Delete All)
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
          },
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
          },
        );
      },
    },
  ];

  // Section: Render Layout
  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col w-full">
        <div>
          <Breadcrumb
            current={{
              label: "จัดการบัญชี",
              to: "/super/accounts/all",
              fromSidebar: true, // << สำคัญ : มาจาก sidebar
            }}
          />
          <h1 className="text-[20px] font-bold text-black">จัดการบัญชี</h1>

          <div className="flex items-center justify-between w-full mt-2 mb-4">
            {/* Section: Search + Filter */}
            <div className="flex items-center gap-2">
              <div className="w-[260px]">
                <SearchBarTable
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-[140px]">
                <FiltersForCM
                  options={optionsRole}
                  selected={filterRole}
                  onChange={(value) => setFilterRole(value)}
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
          data={filteredRows}
          getKey={(row) => row.id.toString()}
          columns={columns}
          selectable={true}
          pageSizeOptions={[10, 30, 50]}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
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
          open={isModalOpen}
          title={modalTitle}
          text={modalText}
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={() => {
            onConfirmAction();
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
