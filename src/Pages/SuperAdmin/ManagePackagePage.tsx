/*
 * คำอธิบาย : Component หน้าสำหรับจัดการแพ็กเกจ (สำหรับ Superadmin)
 * - แสดงรายการแพ็กเกจทั้งหมดในรูปแบบตาราง
 * - รองรับการค้นหา, การแบ่งหน้า (Pagination)
 * - รองรับการลบ (เดี่ยว/กลุ่ม) และการแก้ไข
 * Input: -
 * Output: หน้าตารางจัดการแพ็กเกจ
 */
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/Components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import axios from "axios";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiUrl = import.meta.env.VITE_API_URL;

type Row = {
  id: number;
  title: string;
  community: string;
  owner: string;
  published: boolean;
  approved: boolean;
};

const bulkActions: BulkAction<Row>[] = [
  {
    id: "bulk-delete",
    label: "ลบทั้งหมด",
    icon: TrashIcon,
    intent: "danger",
    confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      const packageIdList = rows.map((row) => row.id);
      console.log("bulk delete:", packageIdList);
    },
  },
];

export default function ManagePackageSuperAdmin() {
  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "ชื่อแพ็กเกจ",
      className: "min-w-[240px]",

      /*
       * คำอธิบาย : Render ชื่อแพ็กเกจเป็นปุ่มที่คลิกได้
       * Input: row - ข้อมูลแถว
       * Output : JSX Element (button)
       */
      render: (row) => (
        <button
          type="button"
          className="hover:underline text-left"
          onClick={() => navigate(`/super/package/${row.id}`)}
        >
          {row.title}
        </button>
      ),
    },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "owner", header: "ผู้ดูแล" },
    {
      key: "published",
      header: "สถานะแพ็กเกจ",
      render: (row) => (row.published ? "เผยแพร่" : "ไม่เผยแพร่"),
    },
    {
      key: "approved",
      header: "สถานะการอนุมัติ",
      render: (row) => (row.approved ? "อนุมัติ" : "รออนุมัติ"),
    },
  ];
  const navigate = useNavigate();

  const [tableRows, setTableRows] = React.useState<Row[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /*
   * คำอธิบาย : (Callback) โหลดข้อมูลแพ็กเกจจาก API ตาม page และ limit ปัจจุบัน
   * Input: - (ใช้ currentPage, pageSize จาก state)
   * Output : (void) - อัปเดต tableRows, totalItems, และ isLoading state
   */
  const reloadPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/super/packages`, {
        params: { page: currentPage, limit: pageSize },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      const payload = response?.data;
      let rawDataList: any =
        payload?.data?.data ??
        payload?.data ??
        payload?.items ??
        payload?.rows ??
        payload;

      if (!Array.isArray(rawDataList)) {
        console.warn("Expected array but got:", rawDataList);
        rawDataList = [];
      }

      const totalCount =
        payload?.pagination?.totalCount ??
        payload?.data?.pagination?.totalCount ??
        payload?.total ??
        payload?.totalCount ??
        rawDataList.length;

      const mappedRows: Row[] = rawDataList.map(
        (packageItem: any): Row => ({
          id: Number(packageItem?.id ?? packageItem?.pk_id ?? 0),
          title: packageItem?.name ?? packageItem?.title ?? "-",
          community: packageItem?.community?.name ?? packageItem?.communityName ?? "-",
          owner: packageItem?.overseerPackage
            ? `${packageItem.overseerPackage.fname ?? ""} ${packageItem.overseerPackage.lname ?? ""
              }`.trim() ||
            packageItem.overseerPackage.username ||
            "-"
            : packageItem?.ownerName ?? "-",
          published:
            packageItem?.statusPackage === "PUBLISH" ||
            packageItem?.published === true ||
            packageItem?.isPublished === true,
          approved:
            packageItem?.statusApprove === "APPROVE" ||
            packageItem?.approved === true ||
            packageItem?.isApproved === true,
        })
      );

      setTableRows(mappedRows);
      setTotalItems(Number.isFinite(totalCount) ? Number(totalCount) : mappedRows.length);
    } catch (error: any) {
      console.error("reloadPackages error:", error?.response?.data ?? error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  /*
   * คำอธิบาย : (Callback) Handler ที่ถูกเรียกเมื่อผู้ใช้กดยืนยันการลบจาก Modal
   * Input: - (ใช้ rowToDelete จาก state)
   * Output : (void) - (async) เรียก API ลบ, แสดง alert, และโหลดข้อมูลใหม่
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!rowToDelete) return;
    const rowId = rowToDelete.id;
    const rowTitle = rowToDelete.title;
    setIsDeleteModalOpen(false);

    try {
      await axios.patch(
        `${apiUrl}/super/package/${rowId}`,
        null,
        { withCredentials: true }
      );

      await reloadPackages();
    } catch (error: any) {
      console.error("delete failed:", error?.response?.data ?? error);
      alert(
        `ลบไม่สำเร็จ (${rowTitle}): ${error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "unknown error"
        }`
      );
    } finally {
      setRowToDelete(null);
    }
  }, [rowToDelete, reloadPackages]);

  const rowActions: DataTableActionsConfig<Row> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "left",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/super/package/${row.id}/edit`),
        delete: (row) => {
          setRowToDelete(row);
          setIsDeleteModalOpen(true);
        },
      },
    }),
    [navigate]
  );

  React.useEffect(() => {
    reloadPackages();
  }, [reloadPackages]);
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * คำอธิบาย : แปลงสตริงเป็น lowercase, normalize, และตัดช่องว่าง
   * Input: text - สตริงที่ต้องการแปลง
   * Output : สตริงที่แปลงแล้ว
   */
  const normalizeText = (text: string) =>
    (text ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

  /*
   * คำอธิบาย : แปลง boolean 'published' เป็นข้อความ
   * Input: row - object ข้อมูล
   * Output : สตริง "เผยแพร่" หรือ "ไม่เผยแพร่"
   */
  const toPublishedText = (row: Row) => (row.published ? "เผยแพร่" : "ไม่เผยแพร่");

  /*
   * คำอธิบาย : แปลง boolean 'approved' เป็นข้อความ
   * Input: row - object ข้อมูล
   * Output : สตริง "อนุมัติ" หรือ "รออนุมัติ"
   */
  const toApprovedText = (row: Row) => (row.approved ? "อนุมัติ" : "รออนุมัติ");

  const filteredRows = React.useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return tableRows;
    return tableRows.filter((row) => {
      const haystacks = [
        row.title,
        row.community,
        row.owner,
        toPublishedText(row),
        toApprovedText(row),
      ].map(normalizeText);
      return haystacks.some((haystack) => haystack.includes(query));
    });
  }, [tableRows, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /*
  * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าคำขออนุมัติแพ็กเกจของผู้ดูแลระบบ
  * Input : -
  * Output : (void) เรียกใช้ navigate เพื่อนำผู้ใช้ไปยังหน้า "/super/package-requests"
  */
  const goToApprovalRequests = () => navigate("/super/package-requests");

  /*
  * คำอธิบาย : กำหนดออบเจกต์การแบ่งหน้า (Pagination) สำหรับส่งให้ Component DataTable
  * Input : - (ใช้ currentPage, pageSize และ totalItems จาก state ภายใน Component)
  * Output : ออบเจกต์ pagination ที่ประกอบด้วย currentPage, totalPages, totalCount และ limit
  */
  const pagination = React.useMemo(() => ({
    currentPage,
    totalPages: Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 10))),
    totalCount: totalItems,
    limit: pageSize,
  }), [currentPage, pageSize, totalItems]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
          current={{
            label: "จัดการแพ็กเกจ",
            to: `/super/packages/all`,
            fromSidebar: true,
          }}
        />
      </div>

      {/* หัวข้อและช่องค้นหา */}
      <div className="flex flex-col gap-2 -mt-3">
        <h1 className="text-xl font-bold">จัดการแพ็กเกจ</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button type="confirm-admin" onClick={goToApprovalRequests}>
              คำขออนุมัติ
            </Button>
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <DataTable<Row>
        data={filteredRows}
        columns={columns}
        getKey={(row) => row.id.toString()}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pagination={pagination}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        isLoading={isLoading}
        theme="brand"
      />

      {/* Modal สำหรับยืนยันการลบ */}
      <Modal
        open={isDeleteModalOpen}
        title="ยืนยันการลบ"
        text={`คุณต้องการลบแพ็กเกจ "${rowToDelete?.title ?? ""}" ใช่หรือไม่?`}
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRowToDelete(null);
        }}
      />
    </div>
  );
}
