/**
 * คำอธิบาย: หน้าจัดการที่พักในชุมชน (Super Admin)
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import { Modal } from "@/Components/Modal/Modal";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { TrashIcon } from "@/Components/Tables/Icon";
import { getHomestaysAll, deleteHomestayBySuperAdmin } from "@/Libs/HomestayService";
import { getCommunityById } from "@/Libs/CommunityService";
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";

/**
 * คำอธิบาย: โครงสร้างข้อมูลที่พัก (Homestay) 
 * Input: -
 * Output: -
 */
type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

/**
 * คำอธิบาย: แปลงข้อความให้อยู่ในรูปแบบมาตรฐานสำหรับการค้นหา
 * Input: text - ข้อความที่ต้องการแปลง
 * Output: string - ข้อความตัวพิมพ์เล็ก ตัดช่องว่างส่วนเกิน
 */
const normalizeText = (text: string) =>
  (text ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * คำอธิบาย: Component สำหรับจัดการข้อมูลที่พักในชุมชน
 * Input: - (รับ Params communityId จาก URL)
 * Output: JSX Element หน้า ManageHomestayPage
 */
export function ManageHomestayPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState("-");
  const [homestayRows, setHomestayRows] = useState<HomestayRow[]>([]); // เปลี่ยน rows เป็น homestayRows
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<HomestayRow[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * คำอธิบาย: ดึงข้อมูลชื่อชุมชนจาก communityId เพื่อแสดงใน Breadcrumb
   * Input: -
   * Output: -
   */
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) return;
        const response = await getCommunityById(Number(communityId));
        setCommunityName(response.data?.data?.name ?? "-");
      } catch (error) {
        console.error(error);
      }
    }
    fetchCommunity();
  }, [communityId]);

  /**
   * คำอธิบาย: ดึงข้อมูลรายการที่พักทั้งหมดของชุมชนตามหน้าและจำนวนที่กำหนด
   * Input: -
   * Output: -
   */
  const fetchData = useCallback(async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: responseData } = await getHomestaysAll(
        Number(communityId),
        currentPage,
        pageSize,
      );
      const homestayPayload = responseData?.data;
      const homestayLists = Array.isArray(homestayPayload?.data) ? homestayPayload.data : [];

      setHomestayRows(
        homestayLists.map((homestay: any) => ({
          id: homestay.id,
          name: homestay.name ?? "-",
          facility: homestay.facility ?? "-",
          type: homestay.type ?? "-",
        })),
      );

      setTotalPages(homestayPayload?.pagination?.totalPages ?? 1);
      setTotalCount(homestayPayload?.pagination?.totalCount ?? homestayLists.length);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [communityId, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * คำอธิบาย: กรองรายการที่พักตามคำค้นหา
   * Input: homestayRows, searchQuery
   * Output: HomestayRow[] ที่ตรงกับคำค้นหา
   */
  const filteredRows = useMemo(() => {
    const normalizedSearchQuery = normalizeText(searchQuery);
    if (!normalizedSearchQuery) return homestayRows;
    return homestayRows.filter((row) =>
      [row.name, row.facility, row.type].some((fieldValue) =>
        normalizeText(fieldValue).includes(normalizedSearchQuery),
      ),
    );
  }, [homestayRows, searchQuery]);

  /**
   * คำอธิบาย: ลบที่พัก 1 รายการตาม deleteId
   * Input: -
   * Output: -
   */
  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    setIsDeleting(true);
    setIsConfirmModalOpen(false);

    const idToDelete = deleteId;
    setDeleteId(null);

    try {
      await deleteHomestayBySuperAdmin(idToDelete);
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบที่พักได้");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * คำอธิบาย: ลบที่พักหลายรายการพร้อมกัน
   * Input: -
   * Output: -
   */
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0 || isDeleting) return;

    setIsDeleting(true);
    setIsBulkConfirmModalOpen(false);

    const homestayIds = selectedRows.map((row) => row.id);
    setSelectedRows([]);

    try {
      await Promise.all(homestayIds.map((id) => deleteHomestayBySuperAdmin(id)));
      setHomestayRows((prevRows) => prevRows.filter((row) => !homestayIds.includes(row.id)));
      setTotalCount((prevCount) => prevCount - homestayIds.length);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบหลายรายการได้");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * คำอธิบาย: ยกเลิกการลบรายการเดียว
   * Input: -
   * Output: -
   */
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setDeleteId(null);
  };

  /**
   * คำอธิบาย: ยกเลิกการลบหลายรายการ
   * Input: -
   * Output: -
   */
  const handleCancelBulkDelete = () => {
    setIsBulkConfirmModalOpen(false);
    setSelectedRows([]);
  };

  /**
   * คำอธิบาย: กำหนดคอลัมน์สำหรับแสดงข้อมูลในตาราง
   * Input: communityId
   * Output: Array ของ Column config
   */
  const columns: Column<HomestayRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "ชื่อที่พัก",
        className: "min-w-[200px]",
        render: (row) => (
          <Link
            to={`/super/community/${communityId}/homestay/${row.id}`}
            className="text-dark-green font-medium hover:underline"
          >
            {row.name}
          </Link>
        ),
      },
      {
        key: "facility",
        header: "สิ่งอำนวยความสะดวก",
      },
      {
        key: "type",
        header: "ประเภทห้อง",
      },
    ],
    [communityId],
  );

  /**
   * คำอธิบาย: กำหนด Actions สำหรับแต่ละแถว (แก้ไข/ลบ)
   * Input: communityId, navigate
   * Output: DataTableActionsConfig
   */
  const rowActions: DataTableActionsConfig<HomestayRow> = useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/super/community/${communityId}/homestay/${row.id}/edit`),
        delete: (row) => {
          setDeleteId(row.id);
          setIsConfirmModalOpen(true);
        },
      },
    }),
    [communityId, navigate],
  );

  /**
   * คำอธิบาย: กำหนด Bulk Actions (ลบทั้งหมด)
   * Input: -
   * Output: Array ของ BulkAction
   */
  const bulkActions: BulkAction<HomestayRow>[] = useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (rows) => {
          if (rows.length === 0) return;
          setSelectedRows(rows);
          setIsBulkConfirmModalOpen(true);
        },
      },
    ],
    [],
  );

  /**
   * คำอธิบาย: จัดการเหตุการณ์จาก Pagination และ Search
   * Input: page, size
   * Output: -
   */
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
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
      {/* Breadcrumb */}
      <Breadcrumb
        current={{
          label: "จัดการที่พัก",
          to: `/super/community/${communityId}/homestay/all`,
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">จัดการที่พัก</h1>

        {/* Search + Add Button */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1 max-w-md">
            <SearchBarTable value={searchQuery} onChange={handleSearchChange} />
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => navigate(`/super/community/${communityId}/homestay/create`)}
              aria-label="เพิ่มที่พักใหม่"
            >
              <span>+ เพิ่มที่พัก</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded">{errorMessage}</div>
      )}

      {/* Data Table */}
      <DataTable<HomestayRow>
        data={filteredRows}
        getKey={(row) => String(row.id)}
        columns={columns}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage,
          totalPages,
          totalCount,
          limit: pageSize,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectedChange={setSelectedRows}
        isLoading={isLoading}
        theme="brand"
      />

      {/* Single Delete Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkConfirmModalOpen}
        title="ยืนยันการลบหลายรายการ"
        text={`คุณต้องการลบที่พักจำนวน ${selectedRows.length} รายการหรือไม่?`}
        onConfirm={handleBulkDelete}
        onCancel={handleCancelBulkDelete}
      />
    </div>
  );
}
