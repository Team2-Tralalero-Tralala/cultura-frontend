/**
 * คำอธิบาย : Component สำหรับแสดงประวัติการจองของผู้ใช้งานฝั่งผู้ดูแล (Admin / Member)
 * โดยรองรับการดึงข้อมูลจาก backend ตาม role,
 * การแบ่งหน้า (pagination), การค้นหา และการกรองสถานะการจอง
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/Components/Button";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import type { Column, Pagination } from "@/Components/Tables/Types";
import type { BookingHistoryItem } from "../../Types/BookingHistory";
import * as BookingHistoriesService from "@/Libs/BookingHistoryService";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const statusLabelsTh: Record<string, string> = {
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
} as const;

const statusOptions = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "BOOKED" },
  { label: "ปฏิเสธการจอง", value: "REJECTED" },
  { label: "คืนเงินแล้ว", value: "REFUNDED" },
  { label: "ปฏิเสธการคืนเงิน", value: "REFUND_REJECTED" },
] as const;

type BookingRow = {
  customerName: string;
  activityTitle: string;
  price: string;
  status: string;
  evidence: string;
  bookedAt: string;
};

type BookingHistoryResp = {
  list: BookingHistoryItem[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalCount?: number;
  hasNext?: boolean;
};

const tableColumns: Column<BookingRow>[] = [
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  { key: "price", header: "ราคา", className: "min-w-[120px]" },
  { key: "status", header: "สถานะ", className: "min-w-[160px]" },
  { key: "evidence", header: "หลักฐาน", className: "min-w-[160px]" },
  { key: "bookedAt", header: "เวลา", className: "min-w-[180px]" },
];

/**
 * คำอธิบาย: แปลงข้อมูลประวัติการจองจากรูปแบบ API (BookingHistoryItem)
 * ให้อยู่ในรูปแบบที่พร้อมแสดงผลในตาราง (BookingRow)
 * Input:
 *   - item (BookingHistoryItem): ข้อมูลประวัติการจองจาก backend
 * Output:
 *   - BookingRow: ข้อมูลที่ผ่านการจัดรูปแบบแล้ว
 *     - customerName: ชื่อ–นามสกุลผู้จอง
 *     - activityTitle: ชื่อแพ็กเกจ
 *     - price: ราคาที่จัดรูปแบบเป็นสกุลเงินบาท
 *     - status: สถานะการจอง (ข้อความภาษาไทย)
 *     - evidence: หลักฐานการโอนเงิน
 *     - bookedAt: วันที่และเวลาที่ทำการจอง (รูปแบบภาษาไทย)
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
  const status = statusLabelsTh[rawStatus] ?? "-";
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
 * คำอธิบาย: Component สำหรับแสดงประวัติการจองของผู้ใช้งานฝั่งผู้ดูแล (Admin / Member)
 * โดยรองรับการดึงข้อมูลจาก backend ตาม role,
 * การแบ่งหน้า (pagination), การค้นหา และการกรองสถานะการจอง
 * Input:
 *   - ไม่มี (อาศัยข้อมูลจาก service และ state ภายใน component)
 * Output:
 *   - React.ReactElement: หน้าแสดงผลตารางประวัติการจอง พร้อมตัวกรองและการแบ่งหน้า
 */
export default function ManageBookingHistoryPage(): React.ReactElement {
  const navigate = useNavigate();
  const [tableRows, setTableRows] = useState<BookingRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * คำอธิบาย: เรียก service เพื่อโหลดข้อมูลตามหน้า/จำนวนเรคอร์ด และแมปเป็นแถวสำหรับตาราง
   * Input: p: number (หน้า), l?: number (จำนวนต่อหน้า)
   * Output: Promise<void>
   */
  const loadPageData = useCallback(async (p: number, l?: number) => {
    setIsLoading(true);
    try {
      const resp: BookingHistoryResp =
        typeof l === "number"
          ? await BookingHistoriesService.fetchBookingHistoriesByRole(p, l)
          : await BookingHistoriesService.fetchBookingHistoriesByRole(p);

      const mappedRows = (resp.list ?? []).map(mapApiToRow);
      setTableRows(mappedRows);

      const serverLimit = resp.limit ?? l ?? (mappedRows.length > 0 ? mappedRows.length : 10);
      const serverPage = resp.page ?? p;
      const serverTotalPages =
        resp.totalPages ??
        (resp.hasNext !== undefined ? (resp.hasNext ? serverPage + 1 : serverPage) : serverPage);
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

  useEffect(() => {
    void loadPageData(page, limit);
  }, [page, limit, loadPageData]);

  /**
   * คำอธิบาย: กรองแถวตามสถานะที่เลือก และค้นหาด้วยข้อความ (client-side)
   */
  const filteredRows = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase().trim();

    const subset =
      selectedStatus === "ALL"
        ? tableRows
        : tableRows.filter(
            (r) => r.status === statusLabelsTh[selectedStatus as keyof typeof statusLabelsTh],
          );

    if (!q) return subset;
    return subset.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q));
  }, [tableRows, searchQuery, selectedStatus]);

  /**
   * คำอธิบาย: สร้างคีย์สตริงที่มีเสถียรภาพต่อแถวสำหรับ DataTable
   * Input: r: BookingRow
   * Output: string
   */
  const getRowKey = (r: BookingRow) =>
    `${r.customerName}|${r.activityTitle}|${r.price}|${r.bookedAt}|${r.evidence}`;

  /**
   * คำอธิบาย: กำหนดค่าการแบ่งหน้าให้ DataTable
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
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <FilterDropdown
              options={statusOptions as unknown as { label: string; value: string }[]}
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
        <DataTable<BookingRow>
          data={filteredRows}
          getKey={getRowKey}
          columns={tableColumns}
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
