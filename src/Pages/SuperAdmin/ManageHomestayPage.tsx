/**
 * หน้า: จัดการที่พักในชุมชน (Super Admin)
 * คำอธิบาย:
 * - แสดงรายการที่พักทั้งหมดของชุมชน
 * - รองรับค้นหา / ลบทีละรายการ / ลบหลายรายการ (Bulk Delete)
 * - Breadcrumb ใช้ Component กลาง
 * - ใช้เฉพาะ Role: SuperAdmin
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
import { Icon } from "@iconify/react";

/*
 * คำอธิบาย : Custom Hook สำหรับชะลอการอัปเดตค่า (Debounce) ช่วยลดการเรียก API ถี่เกินไปในขณะที่ค่า value เปลี่ยนแปลงต่อเนื่อง (เช่น การพิมพ์ค้นหา)
 * Input :
 * - value (T) : ค่าที่ต้องการหน่วงเวลา
 * - delay (number) : ระยะเวลาที่ต้องการหน่วง (หน่วย milliseconds)
 * Output : ค่าล่าสุดที่ผ่านการหน่วงเวลาแล้ว (Debounced Value)
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}


type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

type HomestayDtoFromApi = {
  id: number;
  name: string | null;
  facility: string | null;
  type: string | null;
};

/*
 * คำอธิบาย:
 *  Component สำหรับจัดการข้อมูลที่พักในชุมชน สำหรับผู้ใช้งาน Role: SuperAdmin
 *  รองรับการแสดงรายการ ค้นหา แบ่งหน้า และลบข้อมูล (เดี่ยว / หลายรายการ)
 * Input:
 *  - communityId: string
 *    รหัสชุมชนที่รับมาจาก URL parameter
 * Output:
 *  - Render หน้าแสดงตารางรายการที่พัก
 *  - จัดการ state ที่เกี่ยวข้องกับข้อมูล การค้นหา การแบ่งหน้า และการลบข้อมูล
 */
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  const [communityName, setCommunityName] = useState("-");
  const [homestayRows, setHomestayRows] = useState<HomestayRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // เก็บจำนวนรายการทั้งหมดที่ค้นเจอ

  const [selectedRows, setSelectedRows] = useState<HomestayRow[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenBulkConfirm, setIsOpenBulkConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /*
   * คำอธิบาย: ดึงข้อมูลชื่อชุมชนจาก communityId
   * ใช้สำหรับแสดงใน Header และ Breadcrumb
   * Input
   *  - communityId: string (จาก URL parameter)
   * Output
   *  - อัปเดต state: communityName
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

  /*
   * คำอธิบาย: ดึงข้อมูลรายการที่พักทั้งหมดของชุมชนตามหน้าและจำนวนที่กำหนด
   * Input:
   *  - communityId: string
   *  - currentPage: number
   *  - pageSize: number
   * Output:
   *  - อัปเดต state:
   *    - homestayRows
   *    - totalPages
   *    - totalCount
   *    - isLoading
   *    - errorMessage (กรณี error)
   */
  const fetchData = useCallback(async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getHomestaysAll(
        Number(communityId),
        currentPage,
        pageSize,
        debouncedSearch // ส่งคำค้นหาไป
      );

      const responseData = response.data;
      const homestayPayload = responseData?.data;

      const homestayLists: HomestayDtoFromApi[] = Array.isArray(homestayPayload?.data)
        ? homestayPayload.data
        : [];

      // Mapping ข้อมูล
      setHomestayRows(
        homestayLists.map((homestay) => ({
          id: homestay.id,
          name: homestay.name ?? "-",
          facility: homestay.facility ?? "-",
          type: homestay.type ?? "-",
        }))
      );

      setTotalCount(homestayPayload?.pagination?.totalCount ?? 0);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [communityId, currentPage, pageSize, debouncedSearch]);

  // เรียก fetchData เมื่อค่าเปลี่ยน
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);


 /*
   * คำอธิบาย: ลบที่พัก 1 รายการตาม deleteId
   * Input:
   *  - deleteId: number | null
   * Output:
   *  - เรียก API ลบข้อมูล
   *  - โหลดข้อมูลใหม่
   *  - รีเซ็ตสถานะการลบ
   */
  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    setIsOpenConfirm(false);
    try {
      await deleteHomestayBySuperAdmin(deleteId);
      await fetchData(); // โหลดใหม่
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบที่พักได้");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };
 /*
   * คำอธิบาย: ลบที่พักหลายรายการพร้อมกัน
   * Input:
   *  - selectedRows: HomestayRow[]
   * Output:
   *  - ลบข้อมูลตาม id ที่เลือก
   *  - อัปเดต homestayRows และ totalCount
   */
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setIsOpenBulkConfirm(false);
    const homestayIds = selectedRows.map((row) => row.id);

    try {
      await Promise.all(homestayIds.map((id) => deleteHomestayBySuperAdmin(id)));
      // โหลดข้อมูลใหม่จาก Server เพื่อความชัวร์เรื่อง Pagination
      await fetchData();
      setSelectedRows([]);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบหลายรายการได้");
    } finally {
      setIsDeleting(false);
    }
  };

/*
   * คำอธิบาย: ยกเลิกการลบรายการเดียว
   * Input: -
   * Output:
   *  - ปิด Confirm Modal
   *  - รีเซ็ต deleteId
   */
   const handleCancelDelete = () => {
    setIsOpenConfirm(false);
    setDeleteId(null);
  };

  /*
   * คำอธิบาย: ยกเลิกการลบหลายรายการ
   * Input: -
   * Output:
   *  - ปิด Bulk Confirm Modal
   *  - ล้างรายการที่เลือก
   */
  const handleCancelBulkDelete = () => {
    setIsOpenBulkConfirm(false);
    setSelectedRows([]);
  };
  /*
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
      { key: "facility", header: "สิ่งอำนวยความสะดวก" },
      { key: "type", header: "ประเภท" },
    ],
    [communityId]
  );

  /*
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
          setIsOpenConfirm(true);
        },
      },
    }),
    [communityId, navigate]
  );
  /*
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
          setIsOpenBulkConfirm(true);
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Breadcrumb
        current={{
          label: "จัดการที่พัก",
          to: `/super/community/${communityId}/homestay/all`,
        }}
      />

      <div className="flex flex-col gap-2 -mt-4">
        <Link
            to={`/super/community/${communityId}`}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-[#055035]"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <h1 className="font-bold text-xl text-black">จัดการที่พัก</h1>
        </Link>

        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1 max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded">{errorMessage}</div>
      )}

      <DataTable<HomestayRow>
        data={homestayRows} //ส่งข้อมูลดิบที่ได้จาก API (ไม่ต้องผ่าน filter)
        getKey={(row) => String(row.id)}
        columns={columns}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalCount / pageSize), // คำนวณจาก totalCount ที่ถูกต้อง
          totalCount,
          limit: pageSize,
        }}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSelectedChange={setSelectedRows}
        isLoading={isLoading}
        theme="brand"
      />

      <Modal
        isOpen={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการยืนยันการลบที่พักหรือไม่"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />

      <Modal
        isOpen={isOpenBulkConfirm}
        title="ยืนยันการลบที่พักหลายรายการ"
        text={`คุณต้องการลบที่พักจำนวน ${selectedRows.length} รายการหรือไม่`}
        onConfirm={handleBulkDelete}
        onCancel={handleCancelBulkDelete}
      />
    </div>
  );
}
