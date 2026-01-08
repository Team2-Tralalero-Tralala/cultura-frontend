/**
 * Page: ManageHomestayAdmin
 *
 * คำอธิบาย:
 *  - หน้าจัดการข้อมูลที่พักสำหรับผู้ดูแลระบบ (Admin)
 *  - แสดงตารางรายการที่พักภายในชุมชน
 *  - แสดง Breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
 *  - รองรับการค้นหา เพิ่ม แก้ไข และลบข้อมูลที่พัก
 *
 * Responsibilities:
 *  - แสดงข้อมูลที่พักในรูปแบบตาราง
 *  - จัดการการลบแบบรายรายการ และแบบหลายรายการ (Bulk Delete)
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { TrashIcon } from "@/Components/Tables/Icon";
import { getHomestaysAllAdmin, HomestayAdminDelete } from "@/Services/homestay-services";
import type { HomestayRow, HomestayDtoFromApi } from "@/Types/Homestay";
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";

/**
 * คำอธิบาย:
 *  - แปลงข้อความให้อยู่ในรูปแบบมาตรฐานสำหรับการค้นหา
 *  - แปลงเป็นตัวพิมพ์เล็ก และลบช่องว่างส่วนเกิน
 *
 * Input:
 *  - text: string
 *
 * Output:
 *  - string ข้อความที่ถูก normalize แล้ว
 */
const normalizeText = (text: string) =>
  (text ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * Component: ManageHomestayAdmin
 *
 * คำอธิบาย:
 *  - Component หลักสำหรับหน้าแสดงและจัดการข้อมูลที่พัก (Admin)
 *
 * Responsibilities:
 *  - โหลดข้อมูลที่พักจากระบบ
 *  - แสดงข้อมูลในรูปแบบตาราง
 *  - รองรับการค้นหา และการลบข้อมูล
 */
export default function ManageHomestayAdmin() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isOpenBulkConfirm, setIsOpenBulkConfirm] = useState<boolean>(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);

  /**
   * ฟังก์ชัน: reload
   *
   * คำอธิบาย:
   *  - ดึงข้อมูลที่พักทั้งหมดสำหรับผู้ดูแลระบบจาก API
   *  - แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับตาราง
   *
   * Output:
   *  - อัปเดต state: rows, totalItems, isLoading, errorMessage
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHomestaysAllAdmin();
      const homestayList: HomestayDtoFromApi[] = Array.isArray(res.data) ? res.data : [];

      const pagination = res.pagination ?? {};

      const mappedRows: HomestayRow[] = homestayList.map((homestay) => ({
        id: homestay.id,
        name: homestay.name ?? "-",
        facility: homestay.facility ?? "-",
        type: homestay.type ?? "-",
      }));

      setRows(mappedRows);
      setTotalItems(pagination?.totalCount ?? mappedRows.length);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Constant: columns
   *
   * คำอธิบาย:
   *  - กำหนดโครงสร้างคอลัมน์ของตารางข้อมูลที่พัก
   */
  const columns: Column<HomestayRow>[] = [
    {
      key: "name",
      header: "ชื่อที่พัก",
      className: "min-w-[200px]",
      render: (row) => (
        <Link to={`/admin/community/homestay/${row.id}`} className="hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภท" },
  ];

  /**
   * ฟังก์ชัน: rowActions
   * คำอธิบาย:
   *  - กำหนด action ที่สามารถทำได้ในแต่ละแถวของตาราง
   * Input:
   *  - row: HomestayRow
   * Output:
   *  - เรียกใช้งาน navigation หรือเปิด modal ตาม action ที่เลือก
   */
  const rowActions: DataTableActionsConfig<HomestayRow> = {
    header: "จัดการ",
    align: "left",
    width: "120px",
    variant: "icons",
    className: "pl-5",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/admin/community/homestay/${row.id}/edit`),
      delete: (row) => {
        setDeleteId(row.id);
        setIsOpenConfirm(true);
      },
    },
  };

  /**
   * ฟังก์ชัน: filteredRows
   * คำอธิบาย:
   *  - กรองข้อมูลที่พักจาก rows ตามคำค้นหา
   *  - ใช้สำหรับแสดงผลในตาราง
   */
  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    return rows.filter((row) =>
      [row.name, row.facility, row.type].some((value) =>
        normalizeText(value).includes(normalizedQuery)
      )
    );
  }, [rows, searchQuery]);

  /**
   * ฟังก์ชัน: bulkActions
   * คำอธิบาย:
   *  - กำหนด action สำหรับการจัดการหลายแถวพร้อมกัน
   *  - ใช้สำหรับลบข้อมูลที่พักแบบหลายรายการ
   */
  const bulkActions: BulkAction<HomestayRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบที่พักจำนวน ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const ids: number[] = rows.map((r) => r.id);
        setBulkDeleteIds(ids);
        setIsOpenBulkConfirm(true);
      },
    },
  ];

  /**
   * ฟังก์ชัน: handleDelete
   * คำอธิบาย:
   *  - ลบข้อมูลที่พัก 1 รายการ
   *
   * Output:
   *  - รีโหลดข้อมูลตารางใหม่
   */
  const handleDelete = async () => {
    if (!deleteId) return;

    await HomestayAdminDelete(deleteId);
    setIsOpenConfirm(false);
    setDeleteId(null);

    await reload();
  };

  /**
   * ฟังก์ชัน: handleBulkDelete
   *
   * คำอธิบาย:
   *  - ลบข้อมูลที่พักหลายรายการตามรายการที่ถูกเลือก
   *  - ใช้ bulkDeleteIds ในการเรียก API ลบข้อมูล
   *
   * Output:
   *  - ปิด modal ยืนยันการลบ
   *  - รีโหลดข้อมูลตารางใหม่
   */

  const handleBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;

    await Promise.all(bulkDeleteIds.map((id) => HomestayAdminDelete(id)));

    setBulkDeleteIds([]);
    setIsOpenBulkConfirm(false);

    await reload();
  };

  /**
   * Render Section
   *
   * คำอธิบาย:
   *  - แสดงหน้าแสดงข้อมูลที่พัก
   *  - ประกอบด้วย Breadcrumb, Header, Toolbar, Table และ Modal
   */
  return (
    <div className="space-y-4">
      {/* Section: Breadcrumb */}
      <Breadcrumb
        current={{
          label: "จัดการที่พัก",
          to: "/admin/community/homestays",
        }}
      />

      {/* Section: Header */}
      <div className="flex flex-col mt-[-18px]">
        <h1 className="text-[20px] font-bold text-black">จัดการที่พัก</h1>

        {/* Section: Toolbar */}
        <div className="flex items-center gap-3 mt-2">
          <div className="max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="ml-auto">
            <Button type="confirm-admin" onClick={() => navigate(`/admin/community/homestay`)}>
              <span>+ เพิ่มที่พัก</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable<HomestayRow>
          data={filteredRows}
          columns={columns}
          getKey={(row) => String(row.id)}
          actions={rowActions}
          selectable
          bulkActions={bulkActions}
          theme="brand"
          isLoading={isLoading}
          pageSizeOptions={[10, 30, 50]}
          pagination={{
            currentPage,
            totalPages: Math.ceil(totalItems / 10),
            totalCount: totalItems,
            limit: 10,
          }}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </div>

      {/* Modal สำหรับ row delete */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={handleDelete}
        onCancel={() => setIsOpenConfirm(false)}
      />

      {/* Modal สำหรับ bulk delete */}
      <Modal
        open={isOpenBulkConfirm}
        title="ยืนยันการลบที่พัก"
        text={`คุณต้องการลบที่พัก ${bulkDeleteIds.length} รายการหรือไม่?`}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsOpenBulkConfirm(false)}
      />
    </div>
  );
}
