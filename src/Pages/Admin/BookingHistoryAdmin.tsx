/* 
 * คำอธิบาย : Page Component สำหรับหน้า "ประวัติการจอง (Admin)"
 * หน้าที่ :
 *   - ดึงข้อมูลประวัติการจองตามบทบาทจาก API แบบไล่หน้า (pagination)
 *   - แปลงสถานะ EN -> TH เพื่อแสดงผลตาม UI มาตรฐาน (เฉพาะ 4 สถานะ)
 *   - ค้นหา (full-text บน client) + ฟิลเตอร์สถานะ
 *   - ปุ่ม "คำขอคืนเงิน" นำทางไปหน้า /booking/refunds
 * Input  : -
 * Output : React Component ที่แสดงตารางรายการประวัติการจอง
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Components/Tables/Index";
import type { Column } from "../../Components/Tables/Types";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { fetchBookingHistoriesByRole } from "../../Services/booking-history-service";
import FilterDropdown from "../../Components/Filters/Communitys/FiltersForCM";
import Button from "../../Components/Button";

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

type BookingHistoryApiPage = { list?: BookingHistoryApiItem[]; hasNext?: boolean };

/** -------------------- Constants -------------------- */
const PAGE_LIMIT = 50;
const ALLOWED_STATUS = new Set(["BOOKED", "REJECTED", "REFUNDED", "REFUND_REJECTED"]);

const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "จองสำเร็จ" },
  { label: "ปฏิเสธการจอง", value: "ปฏิเสธการจอง" },
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
    // @ts-ignore
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<BookingRow[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<StatusValue>("ALL");

  React.useEffect(() => {
    let isAlive = true;
    async function loadAllPages() {
      setIsLoading(true);
      setErrorMessage(null);
      const accumulatedRows: BookingRow[] = [];
      let pageNumber = 1;
      try {
        while (true) {
          const { list, hasNext } = (await fetchBookingHistoriesByRole(pageNumber, PAGE_LIMIT)) as BookingHistoryApiPage;
          if (!isAlive) return;
          const mappedPageRows: BookingRow[] = (list ?? [])
            .filter((item) => ALLOWED_STATUS.has((item?.status ?? "").toUpperCase()))
            .map((item, idxInPage) => {
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
                `${item?.tourist?.id ?? "t"}-${item?.package?.id ?? "p"}-${item?.bookingAt ?? ""}-${pageNumber}-${idxInPage}`;
              return { id, customerName, activityTitle, price, statusText, evidence, bookedAt, __rawStatus: item?.status ?? null };
            });
          accumulatedRows.push(...mappedPageRows);
          if (!hasNext) break;
          pageNumber += 1;
        }
        if (isAlive) setRows(accumulatedRows);
      } catch (err: unknown) {
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

  const statusFilteredRows = React.useMemo(
    () => (statusFilter === "ALL" ? rows : rows.filter((r) => r.statusText === statusFilter)),
    [rows, statusFilter]
  );

  const filteredRows = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return statusFilteredRows;
    return statusFilteredRows.filter((r) =>
      [r.customerName, r.activityTitle, r.statusText, r.evidence ?? "", new Date(r.bookedAt).toLocaleString("th-TH")]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [statusFilteredRows, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-[14px] text-black">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/member/booking")}>
            จัดการการจอง
          </span>
          <span className="mx-1">{">"}</span>
          <span>ประวัติการจอง</span>
        </div>
        <h1 className="text-[20px] font-semibold text-black">ประวัติการจอง</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-[320px] shrink-0">
          <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <FilterDropdown
          options={STATUS_OPTIONS.map(({ label, value }) => ({ label, value }))}
          selected={statusFilter}
          onChange={(val) => setStatusFilter(val as StatusValue)}
        />
        <Button type="confirm-admin" htmlType="button" onClick={() => navigate("/admin/booking/refunds")}>
          คำขอคืนเงิน
        </Button>
      </div>

      {/* แสดงตารางเปล่าได้เสมอ (ถ้ามี header และโครง UI) */}
      {!isLoading && !errorMessage && (
        <div className="rounded-lg bg-white booking-history-table">
          <DataTable<BookingRow>
            data={filteredRows}
            columns={columns}
            getRowKey={(row) => row.id}
            selectable
            striped
            pageSizeOptions={[10, 30, 50]}
            defaultPageSize={10}
            theme="brand"
            className="bg-white rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
