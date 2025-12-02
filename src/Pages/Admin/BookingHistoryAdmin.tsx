
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/Components/Button";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import type { Column, Pagination } from "@/Components/Tables/Types";
import type { BookingHistoryItem } from "../../Types/BookingHistory";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/*
 * คำอธิบาย : หน้าแสดง "ประวัติการจอง" สำหรับ Admin/CM
 * - ดึงข้อมูล paginated จาก service ตามบทบาทผู้ใช้
 * - รองรับค้นหา (client-side) + กรองตามสถานะ (client-side)
 * - แสดงผลใน DataTable พร้อมควบคุม pagination/limit
 */

/**
 * ฟังก์ชัน : - (ค่าคงที่)
 * คำอธิบาย : แมปสถานะจาก API เป็นป้ายภาษาไทยที่อ่านง่าย
 * Input : -
 * Output: -
 */
const STATUS_LABEL_TH: Record<string, string> = {
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
} as const;

/**
 * ฟังก์ชัน : - (ค่าคงที่)
 * คำอธิบาย : ตัวเลือกสถานะสำหรับ FilterDropdown
 * Input : -
 * Output: -
 */
const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "BOOKED" },
  { label: "ปฏิเสธการจอง", value: "REJECTED" },
  { label: "คืนเงินแล้ว", value: "REFUNDED" },
  { label: "ปฏิเสธการคืนเงิน", value: "REFUND_REJECTED" },
] as const;

/** แถวข้อมูลที่ใช้แสดงใน DataTable (หลัง map จาก API) */
type BookingRow = {
  customerName: string;
  activityTitle: string;
  price: string;
  status: string;
  evidence: string;
  bookedAt: string;
};

/** รูปร่างคำตอบจาก service (เผื่อบางเขตบริการส่งฟิลด์ไม่ครบ) */
type BookingHistoryResp = {
  list: BookingHistoryItem[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalCount?: number;
  hasNext?: boolean;
};

/**
 * ฟังก์ชัน : - (โครงคอลัมน์)
 * คำอธิบาย : ตั้งค่า columns สำหรับ DataTable
 * Input : -
 * Output: Column<BookingRow>[]
 */
const columns: Column<BookingRow>[] = [
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  { key: "price", header: "ราคา", className: "min-w-[120px]" },
  { key: "status", header: "สถานะ", className: "min-w-[160px]" },
  { key: "evidence", header: "หลักฐาน", className: "min-w-[160px]" },
  { key: "bookedAt", header: "เวลา", className: "min-w-[180px]" },
];

/**
 * ฟังก์ชัน : mapApiToRow
 * คำอธิบาย : แปลงวัตถุ BookingHistoryItem จาก API ให้เป็น BookingRow ที่พร้อมแสดงบนตาราง
 * Input : item: BookingHistoryItem
 * Output: BookingRow
 */
const mapApiToRow = (item: BookingHistoryItem): BookingRow => {
  const firstName = item?.tourist?.fname ?? "";
  const lastName = item?.tourist?.lname ?? "";
  const customerName = `${firstName} ${lastName}`.trim() || "-";
  const activityTitle = item?.package?.name ?? "-";
  const price =
    typeof item?.package?.price === "number"
      ? item.package.price.toLocaleString("th-TH", { style: "currency", currency: "THB" })
      : "-";
  const rawStatus = (item?.status ?? "").toUpperCase();
  const status = STATUS_LABEL_TH[rawStatus] ?? "-";
  const evidence = item?.transferSlip ?? "-";
  const bookedAt = item?.bookingAt
    ? new Date(item.bookingAt).toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";
  return { customerName, activityTitle, price, status, evidence, bookedAt };
};

/**
 * ฟังก์ชัน : BookingHistoryAdmin
 * คำอธิบาย : คอมโพเนนต์หลักสำหรับแสดงและจัดการตารางประวัติการจอง (ค้นหา/กรอง/เปลี่ยนหน้า)
 * Input : -
 * Output: React.ReactElement
 */
export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate();

  // ตาราง + ควบคุมการแสดงผล
  const [tableRows, setTableRows] = useState<BookingRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // การแบ่งหน้า
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // สถานะโหลด
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ฟังก์ชัน : loadPageData
   * คำอธิบาย : เรียก service เพื่อโหลดข้อมูลตามหน้า/จำนวนเรคอร์ด และแมปเป็นแถวสำหรับตาราง
   * Input : p: number (หน้า), l?: number (จำนวนต่อหน้า)
   * Output: Promise<void>
   */
  const loadPageData = useCallback(async (p: number, l?: number) => {
    setIsLoading(true);
    try {
      const resp: BookingHistoryResp =
        typeof l === "number" ? await fetchBookingHistoriesByRole(p, l) : await fetchBookingHistoriesByRole(p);

      const mappedRows = (resp.list ?? []).map(mapApiToRow);
      setTableRows(mappedRows);

      // ตั้งค่า pagination จาก server ถ้ามี ไม่งั้นเดาอย่างปลอดภัย
      const serverLimit = resp.limit ?? l ?? (mappedRows.length > 0 ? mappedRows.length : 10);
      const serverPage = resp.page ?? p;
      const serverTotalPages =
        resp.totalPages ?? (resp.hasNext !== undefined ? (resp.hasNext ? serverPage + 1 : serverPage) : serverPage);
      const serverTotalCount =
        resp.totalCount ??
        (resp.hasNext !== undefined
          ? (serverPage - 1) * serverLimit + mappedRows.length + (resp.hasNext ? 1 : 0)
          : mappedRows.length);

      setLimit(serverLimit);
      setTotalPages(Math.max(1, serverTotalPages));
      setTotalCount(Math.max(0, serverTotalCount));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ฟังก์ชัน : useEffect(loadOnMountAndPaging)
   * คำอธิบาย : โหลดข้อมูลเมื่อคอมโพเนนต์เริ่มต้น และเมื่อ page/limit เปลี่ยน
   * Input : - (อิง state page, limit)
   * Output: -
   */
  useEffect(() => {
    void loadPageData(page, limit);
  }, [page, limit, loadPageData]);

  /**
   * ฟังก์ชัน : filteredRows (useMemo)
   * คำอธิบาย : กรองแถวตามสถานะที่เลือก และค้นหาด้วยข้อความ (client-side)
   * Input : - (อิง tableRows, searchQuery, selectedStatus)
   * Output: BookingRow[]
   */
  const filteredRows = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase().trim();

    const subset =
      selectedStatus === "ALL"
        ? tableRows
        : tableRows.filter(
          (r) => r.status === STATUS_LABEL_TH[selectedStatus as keyof typeof STATUS_LABEL_TH]
        );

    if (!q) return subset;
    return subset.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q));
  }, [tableRows, searchQuery, selectedStatus]);

  /**
   * ฟังก์ชัน : getRowKey
   * คำอธิบาย : สร้างคีย์สตริงที่มีเสถียรภาพต่อแถวสำหรับ DataTable
   * Input : r: BookingRow
   * Output: string
   */
  const getRowKey = (r: BookingRow) =>
    `${r.customerName}|${r.activityTitle}|${r.price}|${r.bookedAt}|${r.evidence}`;

  /**
   * ฟังก์ชัน : pagination (อ็อบเจ็กต์)
   * คำอธิบาย : กำหนดค่าการแบ่งหน้าให้ DataTable
   * Input : -
   * Output: Pagination
   */
  const pagination: Pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit: limit ?? 10,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div>
          <Breadcrumb
            current={{
              label: "ประวัติการจอง",
              to: `/admin/bookings-histories/all`,
            }}
          />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">ประวัติการจอง</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/*
             * ฟังก์ชัน : SearchBarTable (component)
             * คำอธิบาย : กล่องค้นหาแบบ client-side
             * Input : value: string, onChange: (e) => void
             * Output: -
             */}
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

            {/*
             * ฟังก์ชัน : FilterDropdown (component)
             * คำอธิบาย : ตัวกรองสถานะการจอง
             * Input : options, selected, onChange
             * Output: -
             */}
            <FilterDropdown
              options={STATUS_OPTIONS as unknown as { label: string; value: string }[]}
              selected={selectedStatus}
              onChange={(v) => setSelectedStatus(v)}
            />
          </div>

          <div>
            <Button type="confirm-admin" onClick={() => navigate("/admin/booking/refunds")}>
              คำขอคืนเงิน
            </Button>
          </div>
        </div>

        {/*
         * ฟังก์ชัน : DataTable (component)
         * คำอธิบาย : ตารางหลักสำหรับแสดงข้อมูลการจอง พร้อมควบคุมหน้า/ขนาดหน้า
         * Input : data, columns, pagination, isLoading, onPageChange, onPageSizeChange, ...
         * Output: -
         */}
        <DataTable<BookingRow>
          data={filteredRows}
          getKey={getRowKey}
          columns={columns}
          theme="brand"
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
          onPageSizeChange={(v) => {
            setLimit(v);
            setPage(1);
          }}
          pageSizeOptions={[10, 30, 50]}
          selectable={false}
        />
      </div>
    </div>
  );
}
