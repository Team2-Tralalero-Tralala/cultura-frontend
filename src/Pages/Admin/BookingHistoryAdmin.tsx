/*
 * คำอธิบาย : Page สำหรับหน้า "ประวัติการจอง" เพื่อดูข้อมูลการจองทั้งหมด 
 * ค้นหาและกรองตามสถานะ ดึงข้อมูลการจองทั้งหมดจาก API (fetchBookingHistoriesByRole)
 * แปลงข้อมูลจาก API ให้พร้อมแสดงในตาราง (mapApiToRow)
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import FilterDropdown from "../../Components/Filters/Communitys/FiltersForCM";
import DataTable from "../../Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";

/*
 * คำอธิบาย : กำหนด Type สำหรับข้อมูลที่ได้จาก API ประวัติการจอง
 * BookingHistoryApiItem - ข้อมูลการจองแต่ละรายการ
 * BookingHistoryApiPage - ใช้ในการแบ่งหน้า (pagination)
 * BookingRow - รูปแบบข้อมูลที่พร้อมแสดงใน DataTable
 */
type BookingHistoryApiItem = {
  id?: string;
  bookingId?: string;
  bookingAt?: string;
  tourist?: { id?: string; fname?: string; lname?: string };
  package?: { id?: string; name?: string; price?: number };
  status?: string | null;
  transferSlip?: string | null;
};

type BookingHistoryApiPage = {
  list?: BookingHistoryApiItem[];
  hasNext?: boolean;
};

type BookingRow = {
  id: string;
  customerName: string;
  activityTitle: string;
  price: string;
  status: string;
  evidence: string;
  bookedAt: string;
};

const PAGE_LIMIT = 50;

type BookingStatus = "BOOKED" | "REJECTED" | "REFUNDED" | "REFUND_REJECTED";

const STATUS_LABEL_TH: Record<BookingStatus, string> = {
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
} as const;

const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" as const },
  { label: STATUS_LABEL_TH.BOOKED, value: "BOOKED" as const },
  { label: STATUS_LABEL_TH.REJECTED, value: "REJECTED" as const },
  { label: STATUS_LABEL_TH.REFUNDED, value: "REFUNDED" as const },
  { label: STATUS_LABEL_TH.REFUND_REJECTED, value: "REFUND_REJECTED" as const },
] as const;

/**
 * ฟังก์ชัน: mapApiToRow
 * หน้าที่: แปลงข้อมูลจาก API ให้อยู่ในรูปแบบแถวของตาราง
 * Input:
 *   - item: BookingHistoryApiItem
 *       ข้อมูลการจองจาก API
 * Output:
 *   - BookingRow
 *       ออบเจ็กต์พร้อมแสดงใน DataTable
 */
const mapApiToRow = (item: BookingHistoryApiItem): BookingRow => {
  const firstName = item?.tourist?.fname ?? "";
  const lastName = item?.tourist?.lname ?? "";
  const customerName = `${firstName} ${lastName}`.trim() || "-";

  const activityTitle = item?.package?.name ?? "-";

  const price =
    typeof item?.package?.price === "number"
      ? item.package.price.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      })
      : "-";

  const rawStatus = (item?.status ?? "").toUpperCase() as BookingStatus | "";
  const status = rawStatus ? STATUS_LABEL_TH[rawStatus] : "-";

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

  const id =
    item?.id ??
    item?.bookingId ??
    `${customerName || "unknown"}-${activityTitle || "activity"}`;

  return { id, customerName, activityTitle, price, status, evidence, bookedAt };
};

/*
 * คอลัมน์ของ DataTable (โครงสร้างสำหรับแสดงผล)
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
 * คอมโพเนนต์หลัก: BookingHistoryAdmin
 * หน้าที่: โหลด/รวมข้อมูลจาก API, จัดการค้นหาและกรอง, แสดงตาราง
 * Input:
 *   - (ไม่มี props)
 * Output:
 *   - React.ReactElement
 * หมายเหตุ:
 *   - ใช้ฮุคหลายตัว (useState/useCallback/useEffect/useMemo) ที่มีสรุป I/O แยกแต่ละส่วนไว้ด้านล่าง
 */
export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate();

  /**
   * สเตต: rows
   * Input:
   *   - setRows(BookingRow[]) จาก loadAllPages()
   * Output:
   *   - ใช้เป็นแหล่งข้อมูลเริ่มต้นก่อนกรองเพื่อส่งให้ DataTable
   */
  const [rows, setRows] = useState<BookingRow[]>([]);

  /**
   * สเตต: searchQuery
   * Input:
   *   - สตริงคำค้นจาก SearchBarTable.onChange(event.target.value)
   * Output:
   *   - ใช้เป็นเงื่อนไขกรองใน filteredRows (useMemo)
   */
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * สเตต: selectedStatus
   * Input:
   *   - ค่าที่เลือกจาก FilterDropdown ("ALL" | "BOOKED" | "REJECTED" | "REFUNDED" | "REFUND_REJECTED")
   * Output:
   *   - ใช้เป็นเงื่อนไขกรองสถานะใน filteredRows (useMemo)
   */
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  /**
   * ฟังก์ชัน: loadAllPages (memoized ด้วย useCallback)
   * หน้าที่: ดึงข้อมูลทุกหน้าจาก API แล้วรวมเป็นรายการเดียว
   * Input:
   *   - ใช้ fetchBookingHistoriesByRole(page: number, limit: number)
   *     ที่คาดหวังผลลัพธ์รูปแบบ BookingHistoryApiPage { list, hasNext }
   * Output:
   *   - อัพเดตรายการทั้งหมดที่ถูก map เป็น BookingRow แล้ว
   */
  const loadAllPages = useCallback(async () => {
    const allRows: BookingRow[] = [];
    let page = 1;

    while (true) {
      const { list, hasNext } = (await fetchBookingHistoriesByRole(
        page,
        PAGE_LIMIT
      )) as BookingHistoryApiPage;

      if (Array.isArray(list) && list.length > 0) {
        allRows.push(...list.map(mapApiToRow));
      }

      if (!hasNext) break;
      page += 1;
    }
    setRows(allRows);
  }, []);

  /**
   * ฮุค: useEffect
   * หน้าที่: เรียก loadAllPages เมื่อคอมโพเนนต์ mount หรือเมื่อ dependency เปลี่ยน
   * Input:
   *   - dependencies: [loadAllPages]
   * Output:
   *   - ไม่มีค่าที่ return
   *   - side-effect: ทำให้เกิดการโหลดข้อมูลและอัพเดต rows
   */
  useEffect(() => {
    void loadAllPages();
  }, [loadAllPages]);

  /**
   * ฮุค: useMemo -> filteredRows
   * หน้าที่: สร้างรายการข้อมูลที่ผ่านการกรองด้วย searchQuery + selectedStatus
   * Input:
   *   - rows: BookingRow[] (ข้อมูลทั้งหมด)
   *   - searchQuery: string (คำค้น; แปลงเป็นตัวพิมพ์เล็กและ trim)
   *   - selectedStatus: string ("ALL" หรือคีย์สถานะอื่น ๆ)
   * Output:
   *   - BookingRow[] (ผลลัพธ์ที่ผ่านการกรองแล้ว)
   * เงื่อนไข:
   *   1) ถ้า selectedStatus === "ALL" จะไม่กรองสถานะ
   *   2) ถ้ามีคำค้น จะทำ text search แบบรวมทุกฟิลด์ของแถว
   */
  const filteredRows = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase().trim();

    const statusFiltered =
      selectedStatus === "ALL"
        ? rows
        : rows.filter(
          (r) =>
            r.status ===
            STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label
        );

    if (!q) return statusFiltered;

    return statusFiltered.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(q)
    );
  }, [rows, searchQuery, selectedStatus]);

  // ส่วน Render หลักของคอมโพเนนต์
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-gray-800">ประวัติการจอง</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FilterDropdown
              options={
                STATUS_OPTIONS as unknown as { label: string; value: string }[]
              }
              selected={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>

          <div>
            <Button type="confirm-admin" onClick={() => navigate("/admin/booking/refunds")}>
              คำขอคืนเงิน
            </Button>
          </div>
        </div>

        <div className="w-full">
          <DataTable<BookingRow>
            data={filteredRows}
            columns={columns}
            getRowKey={(row) => row.id}
            theme="brand"
            striped
            className="bg-white rounded-lg w-full"
          />
        </div>
      </div>
    </div>
  );
}
