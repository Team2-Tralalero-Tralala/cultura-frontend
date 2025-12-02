/**
 * หน้า: จัดการที่พัก (Admin)
 * คำอธิบาย:
 * - แสดงตารางรายการที่พักในชุมชน
 * - breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
 * - ปุ่มย้อนกลับไปหน้ารายละเอียดชุมชน
 * - ชิดขอบ content ให้สม่ำเสมอกับหน้า "จัดการชุมชน"
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

import { getHomestaysAllAdmin } from "@/Services/homestay-services";
import type { HomestayRow, HomestayDtoFromApi } from "@/Types/Homestay";
import type { Column, DataTableActionsConfig } from "@/Components/Tables/Types";

/**
 * ฟังก์ชัน: normalizeText
 * วัตถุประสงค์: แปลงข้อความให้เป็นตัวพิมพ์เล็ก ลบช่องว่างเกิน และ normalize สำหรับค้นหา
 * Input: text (string)
 * Output: string ที่ normalize แล้ว
 */
const normalizeText = (text: string) =>
  (text ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Component: ManageHomestayAdmin
 * วัตถุประสงค์: ใช้สำหรับแสดงตารางข้อมูลที่พัก (Admin)
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

  /**
   * ฟังก์ชัน: reload
   * วัตถุประสงค์: โหลดข้อมูลที่พักทั้งหมดในชุมชน
   * Output: เซตข้อมูลที่พักลงใน state rows
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHomestaysAllAdmin();
      const homestayList: HomestayDtoFromApi[] = Array.isArray(res.data)
        ? res.data
        : [];

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
      if (error instanceof Error)
        setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * ฟังก์ชัน: columns
   * วัตถุประสงค์: กำหนดคอลัมน์ของตารางข้อมูลที่พัก
   */
  const columns: Column<HomestayRow>[] = [
    {
      key: "name",
      header: "ชื่อที่พัก",
      className: "min-w-[200px]",
      render: (row) => (
        <Link
          to={`/admin/community/homestay/${row.id}`}
          className="hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภท" },
  ];

  /**
   * ฟังก์ชัน: rowActions
   * วัตถุประสงค์: กำหนดปุ่มจัดการต่อแถวในตาราง เช่น แก้ไข / ลบ
   * Input: row (HomestayRow)
   * Output: trigger action ตามปุ่มที่เลือก
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
   * วัตถุประสงค์: กรองข้อมูลในตารางตามคำค้นหา
   * Input: searchQuery (string)
   * Output: แสดงเฉพาะรายการที่ตรงกับคำค้นหา
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
   * ส่วน Render:
   * แสดงตารางข้อมูลที่พัก พร้อม Breadcrumb, Toolbar
   */
  return (
    <div className="space-y-4">
      {/* Section: Breadcrumb */}
        <Breadcrumb
          current={{
            label: "จัดการที่พัก",
            to: "/admin/community/homestays",
            fromSidebar: true,
          }}
        />

      {/* Section: Header */}
      <div className="flex flex-col mt-[-18px]">
        <h1 className="text-[20px] font-bold text-black">
          จัดการที่พัก
        </h1>

        {/* Section: Toolbar */}
        <div className="flex items-center gap-3 mt-2">
          <div className="max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto">
            <Button
              type="confirm-admin"
              onClick={() => navigate(`/admin/community/homestay/create`)}
            >
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
    </div>
  );
}
