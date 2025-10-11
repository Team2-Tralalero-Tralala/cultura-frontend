// src/Pages/Admin/BookingHistoryAdmin.tsx
/**
 * คำอธิบาย: หน้า "ประวัติการจอง (Admin)"
 * หน้าที่:
 *   - ดึงข้อมูลประวัติการจองตามบทบาทจาก API: fetchBookingHistoriesByRole (ดึงแบบไล่หน้า)
 *   - แสดงตารางข้อมูลพร้อมค้นหา
 *   - ปุ่มนำทางไปหน้า "คำขอคืนเงิน"
 * Input: ไม่มี (รับค่าผ่านการเรียก API ภายใน)
 * Output: UI ตารางรายการประวัติการจอง
 */

import React from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";

/** -------------------- Types -------------------- */

/** แถวข้อมูลที่ใช้แสดงบนตาราง */
export type BookingRow = {
  id: string;
  customerName: string;
  activityTitle: string;
  price: number;
  statusText: string;
  evidence?: string;
  bookedAt: string;
};

/** โครงร่างข้อมูลรายการที่ API ส่งกลับ (ระบุเท่าที่ใช้งาน เพื่อเลี่ยง any) */
type BookingHistoryApiItem = {
  id?: string;
  bookingId?: string;
  bookingAt?: string;

  tourist?: {
    id?: string;
    fname?: string;
    lname?: string;
  };

  package?: {
    id?: string;
    name?: string;
    price?: number;
  };

  status?: string;
  transferSlip?: string | null;
};

/** โครงร่างผลตอบกลับหนึ่งหน้า (ระบุเฉพาะฟิลด์ที่ถูกใช้งาน) */
type BookingHistoryApiPage = {
  list?: BookingHistoryApiItem[];
  hasNext?: boolean;
};

/** -------------------- Utils -------------------- */
/**
 * คำอธิบาย: แปลง ISO string ให้เป็นวัน-เวลาไทยแบบอ่านง่าย
 * Input : iso (string) – วันที่รูปแบบ ISO
 * Output: string – ข้อความวันที่-เวลาแสดงผลแบบ th-TH
 */
const formatThaiDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("th-TH", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

/** -------------------- Columns -------------------- */
const columns: Column<BookingRow>[] = [
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  {
    key: "price",
    header: <span className="block w-full text-left">ราคา</span>,
    className: "min-w-[120px] text-left",
    // @ts-ignore – ใช้ตามสัญญาของ DataTable
    headerClassName: "text-right",
    render: (row) => (
      <div className="w-full text-left tabular-nums">
        {(row.price ?? 0).toLocaleString("th-TH", { style: "currency", currency: "THB" })}
      </div>
    ),
  },
  { key: "statusText", header: "สถานะ", className: "min-w-[140px]" },
  {
    key: "evidence",
    header: "หลักฐาน",
    className: "min-w-[160px]",
    render: (row) => row.evidence ?? "-",
  },
  {
    key: "bookedAt",
    header: "เวลา",
    className: "min-w-[160px]",
    render: (row) => formatThaiDateTime(row.bookedAt),
  },
];

/** -------------------- Page Component -------------------- */
/**
 * คำอธิบาย: คอมโพเนนต์หน้า Admin – ประวัติการจอง
 * Input : none
 * Output: React Element
 */
export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate();

  // boolean: นำหน้าด้วย is*
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [rows, setRows] = React.useState<BookingRow[]>([]);

  /** -------------------- ดึงข้อมูลทั้งหมด (ไล่หน้า) -------------------- */
  React.useEffect(() => {
    let isAlive = true;

    /**
     * คำอธิบาย: ดึงข้อมูลจาก API แบบไล่หน้าจนครบ แล้ว map เป็น BookingRow
     * Input : none
     * Output: อัปเดต state rows
     */
    async function loadAllPages(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      const accumulatedRows: BookingRow[] = [];
      let page = 1;
      const limit = 100;

      try {
        // ไล่ดึงทีละหน้า
        // หมายเหตุ: เคารพสัญญา hasNext จากฝั่ง API (ไม่เปลี่ยนตรรกะ)
        while (true) {
          const { list, hasNext } = (await fetchBookingHistoriesByRole(
            page,
            limit
          )) as BookingHistoryApiPage;

          if (!isAlive) return;

          const mapped: BookingRow[] = (list ?? []).map((item: BookingHistoryApiItem, index: number) => {
            const firstName = item?.tourist?.fname ?? "";
            const lastName = item?.tourist?.lname ?? "";
            const customerName = `${firstName} ${lastName}`.trim() || "-";

            const activityTitle = item?.package?.name ?? "-";
            const price = typeof item?.package?.price === "number" ? item.package!.price! : 0;
            const statusText = item?.status ?? "-";
            const evidence = item?.transferSlip || undefined;
            const bookedAt = item?.bookingAt ?? new Date().toISOString();

            const id =
              item?.id ??
              item?.bookingId ??
              `${item?.tourist?.id ?? "t"}-${item?.package?.id ?? "p"}-${item?.bookingAt ?? ""}-${page}-${index}`;

            return { id, customerName, activityTitle, price, statusText, evidence, bookedAt };
          });

          accumulatedRows.push(...mapped);

          if (!hasNext) break;
          page += 1;
        }

        if (isAlive) setRows(accumulatedRows);
      } catch (err: unknown) {
        // แสดงข้อความผิดพลาดเป็นภาษาไทยตามมาตรฐาน
        const message = err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลได้";
        if (isAlive) setErrorMessage(message);
      } finally {
        if (isAlive) setIsLoading(false);
      }
    }

    loadAllPages();
    return () => {
      isAlive = false;
    };
  }, []);

  /** -------------------- ฟิลเตอร์ค้นหา -------------------- */
  const filteredRows = React.useMemo<BookingRow[]>(() => {
    const query = (searchQuery || "").trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const haystack = [
        row.customerName,
        row.activityTitle,
        row.statusText,
        row.evidence ?? "",
        new Date(row.bookedAt).toLocaleString("th-TH"),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, searchQuery]);

  /** -------------------- Render -------------------- */
  return (
    <div className="space-y-4">
      {/* breadcrumb + หัวเรื่อง */}
      <div className="flex flex-col gap-1">
        <div
          className="text-sm text-gray-500 cursor-pointer hover:underline"
          onClick={() => navigate("/admin/booking/histories")}
        >
          จัดการการจอง › ประวัติการจอง
        </div>
        <h1 className="text-2xl font-semibold">ประวัติการจอง</h1>
      </div>

      {/* แถบเครื่องมือ: ช่องค้นหา + ปุ่มคำขอคืนเงิน */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button
          type="button"
          className="ml-auto px-5 py-2 rounded-lg bg-[#055035] text-white hover:opacity-90"
          onClick={() => navigate("/admin/booking/refunds")}
        >
          คำขอคืนเงิน
        </button>
      </div>

      {/* สถานะโหลด/ผิดพลาด */}
      {isLoading && <div className="rounded-lg border bg-white p-4 text-sm">กำลังดึงข้อมูลจากระบบ…</div>}
      {errorMessage && (
        <div className="rounded-lg border bg-white p-4 text-sm text-red-600">เกิดข้อผิดพลาด: {errorMessage}</div>
      )}

      {/* ตาราง */}
      {!isLoading && !errorMessage && (
        <div className="rounded-lg bg-white booking-history-table">
          <DataTable<BookingRow>
            data={filteredRows}
            columns={columns}
            getRowKey={(row) => row.id}
            selectable
            striped
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={10}
            theme="brand"
            className="bg-white rounded-lg"
          />
        </div>
      )}

      {!isLoading && !errorMessage && filteredRows.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-6">ไม่พบรายการที่ตรงกับการค้นหา</div>
      )}
    </div>
  );
}
