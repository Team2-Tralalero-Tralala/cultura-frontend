/*
 * Page: ประวัติการจอง
 * - ดึงข้อมูลการจองทั้งหมดจาก API
 * - แปลงข้อมูลให้พร้อมแสดงใน DataTable
 * - ค้นหา + กรองตามสถานะ
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/Components/Button";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import type { BookingHistoryItem } from "../../Types/BookingHistory";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";

/*
 * คำอธิบาย : ค่าจำนวนรายการต่อหน้าที่ใช้เรียก API
 * ใช้เพื่อกำหนดขนาดเพจในการดึงข้อมูลแบบแบ่งหน้า (pagination) เพราะรอ table จากตะวัน
 * Input : -
 * Output: จำนวนแถวต่อหน้าที่ต้องการ
 */
const PAGE_LIMIT = 50;

/*
 * คำอธิบาย : mapstatus (อังกฤษ) -> ป้ายภาษาไทยสำหรับแสดงผลในตาราง
 * ช่วยให้ UI แสดงภาษาไทยแม้ API ส่งค่าสถานะเป็นอังกฤษ
 * Input : key เป็นสถานะอังกฤษ เช่น "BOOKED"
 * Output: label ภาษาไทย เช่น "จองสำเร็จ"
 */
const STATUS_LABEL_TH: Record<string, string> = {
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
};

/*
 * คำอธิบาย : ตัวเลือกใน dropdown สำหรับกรองสถานะ
 * Input : -
 * Output: อ็อบเจ็กต์ {label, value} สำหรับคอมโพเนนต์ FilterDropdown
 */
const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "BOOKED" },
  { label: "ปฏิเสธการจอง", value: "REJECTED" },
  { label: "คืนเงินแล้ว", value: "REFUNDED" },
  { label: "ปฏิเสธการคืนเงิน", value: "REFUND_REJECTED" },
] as const;

/*
 * คำอธิบาย : โครงสร้างข้อมูลหนึ่งแถวสำหรับตาราง DataTable
 * Input : -
 * Output: ชนิดข้อมูลที่ตารางจะรับเข้าไปแสดงผล
 */
type BookingRow = {
  customerName: string;
  activityTitle: string;
  price: string;
  status: string;
  evidence: string;
  bookedAt: string;
};

/*
 * คำอธิบาย : คอลัมน์ของ DataTable กำหนดหัวตารางและ key ที่อ่านจาก BookingRow
 * Input : -
 * Output: อาร์เรย์คอลัมน์ที่ใช้โดยคอมโพเนนต์ DataTable
 */
const columns: Column<BookingRow>[] = [
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  { key: "price", header: "ราคา", className: "min-w-[120px]" },
  { key: "status", header: "สถานะ", className: "min-w-[160px]" },
  { key: "evidence", header: "หลักฐาน", className: "min-w-[160px]" },
  { key: "bookedAt", header: "เวลา", className: "min-w-[180px]" },
];

/*
 * ฟังก์ชัน : mapApiToRow
 * คำอธิบาย : แปลงข้อมูลจาก API (BookingHistoryItem) ให้พร้อมแสดงในตาราง (BookingRow)
 * - ฟอร์แมตราคา (THB)
 * - แม็ปสถานะอังกฤษเป็นป้ายไทย
 * - ฟอร์แมตวันเวลาแบบท้องถิ่น (th-TH)
 * Input  : item - ข้อมูลจาก API หนึ่งรายการ
 * Output : อ็อบเจ็กต์ BookingRow สำหรับ DataTable
 */
const mapApiToRow = (item: BookingHistoryItem): BookingRow => {
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

/*
 * ฟังก์ชัน : BookingHistoryAdmin
 * คำอธิบาย : คอมโพเนนต์หลักของหน้า "ประวัติการจอง"
 * ทำหน้าที่:
 *  - ดึงข้อมูลทุกหน้าแล้วรวม (ผ่าน loadAllPages)
 *  - จัดการ state การค้นหาและตัวกรองสถานะ
 *  - สร้างข้อมูลที่ผ่านการกรองเพื่อส่งให้ DataTable
 * Input  : -
 * Output : องค์ประกอบ UI ของทั้งหน้า
 */
export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate();

  // จัดเก็บข้อมูลแถวทั้งหมด, คำค้นหา, และค่ากรองสถานะที่ผู้ใช้เลือก
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  /*
   * คำอธิบาย : ดึงข้อมูลการจองจาก API แบบแบ่งหน้าและรวมเป็นก้อนเดียว
   * ทำซ้ำจนกว่าจะไม่มีหน้าถัดไป (hasNext เป็น false) จากนั้นอัปเดต state ของ rows
   * Input  : -
   * Output : -
   */
  const loadAllPages = useCallback(async () => {
    const allRows: BookingRow[] = [];
    let page = 1;
    while (true) {
      const { list, hasNext } = await fetchBookingHistoriesByRole(page, PAGE_LIMIT);
      if (Array.isArray(list) && list.length > 0) {
        allRows.push(...list.map(mapApiToRow));
      }
      if (!hasNext) break;
      page += 1;
    }
    setRows(allRows);
  }, []);

  /*
   * คำอธิบาย : เรียกโหลดข้อมูลเมื่อคอมโพเนนต์ mount ครั้งแรก
   * ใช้ useEffect เพื่อให้ loadAllPages ทำงานหนึ่งครั้ง
   * Input  : -
   * Output : -
   */
  useEffect(() => {
    void loadAllPages();
  }, [loadAllPages]);

  /*
   * คำอธิบาย : สร้างรายการแถวที่ผ่านการ "กรองตามสถานะ" และ "ค้นหาแบบ full-text"
   * - หาก selectedStatus === "ALL" จะไม่กรองสถานะ
   * - การค้นหาใช้การรวมค่าของทุก field แล้วแปลงเป็นตัวพิมพ์เล็ก
   * Input  : rows, searchQuery, selectedStatus (ผ่าน dependency)
   * Output : อาร์เรย์ BookingRow ที่พร้อมแสดงผล
   */
  const filteredRows = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase().trim();
    const statusFiltered =
      selectedStatus === "ALL"
        ? rows
        : rows.filter(
            (r) => r.status === STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label
          );
    if (!q) return statusFiltered;
    return statusFiltered.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q));
  }, [rows, searchQuery, selectedStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-gray-800">ประวัติการจอง</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* กล่องค้นหาอัปเดตค่า searchQuery ตามข้อความที่ผู้ใช้พิมพ์ */}
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {/*ตัวกรองสถานะ onChange: อัปเดตค่า selectedStatus ด้วยค่าที่ผู้ใช้เลือก*/}
            <FilterDropdown
              options={STATUS_OPTIONS as unknown as { label: string; value: string }[]}
              selected={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
          <div>
            {/*ปุ่มนำทางไปยังหน้า "คำขอคืนเงิน"onClick: ใช้ useNavigate เปลี่ยนเส้นทางไป /admin/booking/refunds*/}
            <Button type="confirm-admin" onClick={() => navigate("/admin/booking/refunds")}>
              คำขอคืนเงิน
            </Button>
          </div>
        </div>

        {/*ตารางข้อมูลประวัติการจอง*/}
        <DataTable<BookingRow>
          data={filteredRows}
          columns={columns}
          getRowKey={(row, index) => `${row.customerName}-${index}`}
          theme="brand"
          striped
          className="bg-white rounded-lg w-full"
        />
      </div>
    </div>
  );
}
