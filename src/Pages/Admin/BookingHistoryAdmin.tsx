// src/Pages/Admin/BookingHistoryAdmin.tsx
/*
 * คำอธิบาย : Page Component สำหรับหน้า "ประวัติการจอง (Admin)"
 * หน้าที่ :
 *   - ดึงข้อมูลประวัติการจองจาก API แบบไล่หน้า (แต่ดึง "ทีละก้อน" ตาม PAGE_LIMIT)
 *   - ให้ผู้ใช้เลือก PAGE_LIMIT จาก dropdown แล้วโหลดใหม่อัตโนมัติ
 *   - ค้นหา + ฟิลเตอร์สถานะ (ทำบนผลรวมที่โหลดมาแล้ว)
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";
import FilterDropdown from "../../Components/Communitys/FiltersForCM";

/** -------------------- Types -------------------- */

export type BookingRow = {
  id: string;
  customerName: string;
  activityTitle: string;
  price: number;
  statusText: string;
  evidence?: string;
  bookedAt: string;
  __rawStatus?: string | null;
};

type BookingHistoryApiItem = {
  id?: string;
  bookingId?: string;
  bookingAt?: string;
  tourist?: { id?: string; fname?: string; lname?: string };
  package?: { id?: string; name?: string; price?: number };
  status?: string;
  transferSlip?: string | null;
};

type BookingHistoryApiPage = {
  list?: BookingHistoryApiItem[];
  hasNext?: boolean;
};

/** -------------------- Constants -------------------- */

// ค่าเริ่มต้นตามที่ต้องการ
const DEFAULT_PAGE_LIMIT = 10;

// ตัวเลือกให้ผู้ใช้เปลี่ยน PAGE_LIMIT
const SERVER_PAGE_SIZES = [10, 30, 50, 100] as const;

const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "จองสำเร็จ" },
  { label: "ปฏิเสธการจอง", value: "ปฏิเสธการจอง" },
  { label: "รอคืนเงิน", value: "รอคืนเงิน" },
  { label: "คืนเงินแล้ว", value: "คืนเงินแล้ว" },
  { label: "ปฏิเสธการคืนเงิน", value: "ปฏิเสธการคืนเงิน" },
] as const;
type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

/** -------------------- Utils -------------------- */

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

const mapStatusToThai = (status?: string | null): string => {
  switch ((status ?? "").toUpperCase()) {
    case "BOOKED":
      return "จองสำเร็จ";
    case "REJECTED":
      return "ปฏิเสธการจอง";
    case "REFUND_PENDING":
      return "รอคืนเงิน";
    case "REFUNDED":
      return "คืนเงินแล้ว";
    case "REFUND_REJECTED":
      return "ปฏิเสธการคืนเงิน";
    default:
      return "-";
  }
};

/** -------------------- Columns -------------------- */

const columns: Column<BookingRow>[] = [
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  {
    key: "price",
    header: <span className="block w-full text-left">ราคา</span>,
    className: "min-w-[120px] text-left",
    // @ts-ignore – อิงสัญญาจาก DataTable เดิม
    headerClassName: "text-right",
    render: (row) => (
      <div className="w-full text-left tabular-nums">
        {(row.price ?? 0).toLocaleString("th-TH", { style: "currency", currency: "THB" })}
      </div>
    ),
  },
  { key: "statusText", header: "สถานะ", className: "min-w-[160px]" },
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

export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate();

  // loading/error
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // filters & search
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<StatusValue>("ALL");

  // PAGE_LIMIT แบบที่ผู้ใช้เปลี่ยนได้
  const [pageLimit, setPageLimit] = React.useState<number>(DEFAULT_PAGE_LIMIT);

  // data (รวมทุกหน้าที่โหลดมาแบบไล่หน้า ด้วย PAGE_LIMIT ปัจจุบัน)
  const [rows, setRows] = React.useState<BookingRow[]>([]);

  /** โหลดใหม่ทุกครั้งที่ pageLimit เปลี่ยน */
  React.useEffect(() => {
    let isAlive = true;

    async function loadAllPages(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      const accumulated: BookingRow[] = [];
      let page = 1;

      try {
        while (true) {
          const { list, hasNext } = (await fetchBookingHistoriesByRole(page, pageLimit)) as BookingHistoryApiPage;

          if (!isAlive) return;

          const mapped: BookingRow[] = (list ?? []).map((item, idx) => {
            const firstName = item?.tourist?.fname ?? "";
            const lastName = item?.tourist?.lname ?? "";
            const customerName = `${firstName} ${lastName}`.trim() || "-";

            const activityTitle = item?.package?.name ?? "-";
            const price = typeof item?.package?.price === "number" ? item.package!.price! : 0;

            const statusText = mapStatusToThai(item?.status ?? null);
            const evidence = item?.transferSlip || undefined;
            const bookedAt = item?.bookingAt ?? new Date().toISOString();

            const id =
              item?.id ??
              item?.bookingId ??
              `${item?.tourist?.id ?? "t"}-${item?.package?.id ?? "p"}-${item?.bookingAt ?? ""}-${page}-${idx}`;

            return { id, customerName, activityTitle, price, statusText, evidence, bookedAt, __rawStatus: item?.status ?? null };
          });

          accumulated.push(...mapped);

          if (!hasNext) break;
          page += 1;
        }

        if (isAlive) setRows(accumulated);
      } catch (err: unknown) {
        if (isAlive) setErrorMessage(err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลได้");
      } finally {
        if (isAlive) setIsLoading(false);
      }
    }

    void loadAllPages();
    return () => {
      isAlive = false;
    };
  }, [pageLimit]);

  /** ฟิลเตอร์สถานะ + ค้นหา */
  const statusFilteredRows = React.useMemo<BookingRow[]>(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((row) => row.statusText === statusFilter);
  }, [rows, statusFilter]);

  const filteredRows = React.useMemo<BookingRow[]>(() => {
    const query = (searchQuery || "").trim().toLowerCase();
    if (!query) return statusFilteredRows;

    return statusFilteredRows.filter((row) => {
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
  }, [statusFilteredRows, searchQuery]);

  /** Render */
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

      {/* แถบเครื่องมือ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[320px] shrink-0">
          <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <FilterDropdown
          options={STATUS_OPTIONS.map(({ label, value }) => ({ label, value }))}
          selected={statusFilter}
          onChange={(val) => setStatusFilter(val as StatusValue)}
        />

        {/* แถวต่อหน้า — คุม PAGE_LIMIT ที่ใช้เรียก API */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">แถวต่อหน้า (API)</label>
          <select
            value={pageLimit}
            onChange={(e) => setPageLimit(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-white"
          >
            {SERVER_PAGE_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="px-5 py-2 rounded-lg bg-[#055035] text-white hover:opacity-90"
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
            // หมายเหตุ: นี่คือ pagination ฝั่ง UI เท่านั้น
            pageSizeOptions={[10, 30, 50]}
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
