/**
 * คำอธิบาย: หน้าจัดการสมาชิกในแต่ละชุมชน (Super Admin)
 */

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TrashIcon, BanIcon } from "lucide-react";

// Components
import DataTable from "@/Components/Tables/DataTable";
import SearchBarTable from "@/Components/Search/SearchBarTable";
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
import type { AccountCommunityRow } from "@/Types/User";

// Services
import {
  blockAccountById,
  blockMultipleAccounts,
  deleteAccountById,
  deleteMultipleAccounts,
  getAccountInCommunity,
} from "@/Libs/AccountService";
import { Icon } from "@iconify/react";

/**
 * คำอธิบาย: กำหนดคอลัมน์ในตารางสมาชิกชุมชน
 * Input: -
 * Output: -
 */
const columns: Column<AccountCommunityRow>[] = [
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
    key: "activityRole",
    header: "บทบาท",
    className: "min-w-[160px]",
    render: (object) => <div>{object.activityRole || "-"}</div>,
  },
  {
    key: "email",
    header: "ช่องทางติดต่อ",
    className: "min-w-[160px]",
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
 * คำอธิบาย: Component สำหรับจัดการสมาชิกในชุมชน
 * Input: - (รับ Params communityId จาก URL)
 * Output: JSX Element หน้า ManageMemberPage
 */
export function ManageMemberPage() {
  const navigate = useNavigate();

  // Section: State หลัก
  const [rows, setRows] = useState<AccountCommunityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<AccountCommunityRow[]>([]);

  // Section: State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  const params = useParams();

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
    { label: "ผู้ดูแลระบบ", value: "superadmin" },
    { label: "ผู้ดูแลชุมชน", value: "admin" },
    { label: "สมาชิก", value: "member" },
    { label: "ผู้ใช้งานทั่วไป", value: "tourist" },
  ];

  /**
   * คำอธิบาย: ดึงข้อมูลสมาชิกในชุมชนจาก API
   * Input: - (ใช้ pagination, params จาก state)
   * Output: -
   */
  async function fetchData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: resultData, pagination: resultPagination } = await getAccountInCommunity(
        Number(params.communityId),
        pagination.currentPage,
        pagination.limit,
        searchQuery,
      );
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
   * Input: - (ใช้ pagination, params จาก state)
   * Output: -
   */
  useEffect(() => {
    let isCancelled = false;
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const { data: resultData, pagination: resultPagination } = await getAccountInCommunity(
          Number(params.communityId),
          pagination.currentPage,
          pagination.limit,
          searchQuery,
        );

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
   * Input: - (ใช้ searchQuery จาก state)
   * Output: -
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);

    return rows.filter((object) => {
      // กรอง search
      const name = `${object.fname ?? ""} ${object.lname ?? ""}`.trim();
      const email = object.email ?? "";
      const activityRole = object.activityRole ?? "";
      const textMatch =
        !query ||
        normalizeText(name).includes(query) ||
        normalizeText(email).includes(query) ||
        normalizeText(activityRole).includes(query);

      return textMatch;
    });
  }, [rows, searchQuery]);

  /**
   * คำอธิบาย: กำหนด Action สำหรับแต่ละแถวในตาราง (Block, Edit, Delete)
   * Input: -
   * Output: -
   */
  const rowActions: DataTableActionsConfig<AccountCommunityRow> = {
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
   * Input: -
   * Output: -
   */
  const bulkActions: BulkAction<AccountCommunityRow>[] = [
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
              label: "จัดการสมาชิก",
              to: `/super/account/community/${params}`,
            }}
          />
        </div>
        <div className="flex justify-between items-center mb-3">
          <Link
            to={`/super/community/${params.communityId}`}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <h1 className="text-xl font-bold">จัดการสมาชิก</h1>
          </Link>
        </div>

        <div className="flex items-center justify-between w-full mt-2">
          {/* Section: Search + Filter */}
          <div className="flex items-center gap-2">
            <div className="w-[260px]">
              <SearchBarTable
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Error */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Section: Table */}
      <DataTable<AccountCommunityRow>
        data={filteredRows}
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
        isOpen={isModalOpen}
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
  );
}
