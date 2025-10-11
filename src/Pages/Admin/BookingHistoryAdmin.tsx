/*
 * คำอธิบาย : Page Component สำหรับหน้า "ประวัติการจอง (Admin)"
 * หน้าที่ :
 *   - ดึงข้อมูลประวัติการจองตามบทบาทจาก API แบบไล่หน้า (pagination)
 *   - แปลงสถานะ EN -> TH เพื่อแสดงผลตาม UI มาตรฐาน
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
  __rawStatus?: string | null;
};

/** โครงร่างข้อมูลรายการที่ API ส่งกลับ (เท่าที่ใช้งาน) */
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

  status?: string; // BOOKED | REJECTED | REFUND_PENDING | REFUNDED | REFUND_REJECTED
  transferSlip?: string | null;
};

/** เก็บรายการข้อมูลแต่ละหน้า */
type BookingHistoryApiPage = {
  list?: BookingHistoryApiItem[];
  hasNext?: boolean;
};

/** -------------------- Constants -------------------- */

/** ขนาดหน้าในการดึงข้อมูลจาก API (pagination) */
const PAGE_LIMIT = 50;

/** ตัวเลือกสถานะฝั่ง UI (ภาษาไทย) */
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

/*
 * ฟังก์ชัน : formatThaiDateTime
 * คำอธิบาย : แปลง ISO datetime -> วัน-เวลาไทยแบบอ่านง่าย (24 ชม.)
 * Input  : iso (string) – วันที่ในรูปแบบ ISO
 * Output : string – วันที่/เวลาในรูปแบบ th-TH
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

/*
 * ฟังก์ชัน : mapStatusToThai
 * คำอธิบาย : แปลงสถานะ EN -> TH เพื่อใช้แสดงผลในตาราง
 * Input  : status? (string|null) – BOOKED | REJECTED | REFUND_PENDING | REFUNDED | REFUND_REJECTED
 * Output : string – ข้อความสถานะภาษาไทย (ไม่รู้จัก -> "-")
 */
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
  // ชื่อผู้จอง
  { key: "customerName", header: "ชื่อผู้จอง", className: "min-w-[180px]" },
  // ชื่อกิจกรรม : แสดงชื่อกิจกรรมที่จองไว้
  { key: "activityTitle", header: "ชื่อกิจกรรม", className: "min-w-[260px]" },
  // ราคาจัดรูปแบบเป็นสกุลเงินไทย)
  {
    key: "price", header: <span className="block w-full text-left">ราคา</span>, className: "min-w-[120px] text-left",
    // @ts-ignore
    headerClassName: "text-right",
    render: (row) => (
      <div className="w-full text-left tabular-nums">
        {/* แปลงค่า price เป็นรูปแบบสกุลเงินไทย เช่น 1,200.00 ฿ */}
        {(row.price ?? 0).toLocaleString("th-TH", { style: "currency", currency: "THB" })}
      </div>
    ),
  },
  // สถานะ : แสดงสถานะของการจอง เช่น "ชำระเงินแล้ว", "รอชำระ", "ยกเลิก"
  { key: "statusText", header: "สถานะ", className: "min-w-[160px]" },
  // หลักฐานการชำระเงิน ถ้าไม่มีจะแสดง "-"
  { key: "evidence", header: "หลักฐาน", className: "min-w-[160px]", render: (row) => row.evidence ?? "-", },
  //เวลา
  { key: "bookedAt", header: "เวลา", className: "min-w-[160px]", render: (row) => formatThaiDateTime(row.bookedAt), },
];

/** -------------------- Page Component -------------------- */

/*
 * ฟังก์ชัน : BookingHistoryAdmin
 * คำอธิบาย : แสดงหน้าประวัติการจองสำหรับ Admin
 * โดยประกอบด้วย:
 *   - โหลดข้อมูลทั้งหมดแบบไล่หน้า (loop ทีละหน้า จนหมด)
 *   - ฟิลเตอร์สถานะ + ค้นหาในฝั่ง client
 *   - ตารางข้อมูลพร้อมแบ่งหน้า UI
 * Input  : -
 * Output : React.ReactElement – หน้า "ประวัติการจอง"
 */
export default function BookingHistoryAdmin(): React.ReactElement {
  const navigate = useNavigate(); // hook ของ React Router สำหรับเปลี่ยนหน้าไปยังเส้นทางอื่น

  // state: สำหรับควบคุมสถานะ "กำลังโหลด" ข้อมูล
  // true = อยู่ระหว่างโหลด (เช่น fetch ข้อมูลจาก backend)
  // false = โหลดเสร็จหรือยังไม่เริ่มโหลด
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // state: สำหรับเก็บข้อความแสดงข้อผิดพลาด (error message)
  // ถ้าไม่มีข้อผิดพลาด จะเป็น null
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  //  state: สำหรับเก็บข้อความค้นหา (query) ที่ผู้ใช้พิมพ์ในช่องค้นหา
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // state: สำหรับเก็บรายการข้อมูลการจอง (booking rows) ที่ดึงมาจาก backend หรือกรองแล้ว
  const [rows, setRows] = React.useState<BookingRow[]>([]);

  // state: สำหรับเก็บค่าตัวกรองสถานะ (filter) เช่น "ALL", "PAID", "PENDING", "CANCELLED"
  // ใช้เพื่อกรองเฉพาะรายการตามสถานะที่เลือก
  const [statusFilter, setStatusFilter] = React.useState<StatusValue>("ALL");

  /** -------------------- ดึงข้อมูลทั้งหมด (ไล่หน้า) -------------------- */
  React.useEffect(() => {
    let isAlive = true;

    /*
     * ฟังก์ชัน : loadAllPages
     * คำอธิบาย : ดึงข้อมูลทีละหน้าและสะสมเป็นอาร์เรย์เดียวสำหรับแสดงผล
     * Input  : -
     * Output : Promise<void>
     */
    async function loadAllPages(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);


      const accumulatedRows: BookingRow[] = []; // สร้างอาร์เรย์สะสมข้อมูลจากทุกหน้า
      let pageNumber = 1; // เริ่มที่หน้าแรก

      try {
        while (true) {
          // เรียก API ดึงข้อมูลการจองจาก backend โดยส่ง page และ limit
          const { list, hasNext } = (await fetchBookingHistoriesByRole(
            pageNumber,
            PAGE_LIMIT
          )) as BookingHistoryApiPage;

          if (!isAlive) return;

          // แปลงข้อมูลดิบจาก API ให้เป็น BookingRow ที่ DataTable เข้าใจ
          const mappedPageRows: BookingRow[] = (list ?? []).map((item: BookingHistoryApiItem, idxInPage: number) => {
            const firstName = item?.tourist?.fname ?? "";
            const lastName = item?.tourist?.lname ?? "";
            const customerName = `${firstName} ${lastName}`.trim() || "-";

            const activityTitle = item?.package?.name ?? "-";
            const price = typeof item?.package?.price === "number" ? item.package!.price! : 0;

            const statusText = mapStatusToThai(item?.status ?? null); // สถานะแปลเป็นข้อความภาษาไทย (ใช้ฟังก์ชัน mapStatusToThai)
            const evidence = item?.transferSlip || undefined;
            const bookedAt = item?.bookingAt ?? new Date().toISOString();

            const id =
              item?.id ??
              item?.bookingId ??
              `${item?.tourist?.id ?? "t"}-${item?.package?.id ?? "p"}-${item?.bookingAt ?? ""}-${pageNumber}-${idxInPage}`;

            // คืนอ็อบเจ็กต์ BookingRow ที่พร้อมใช้ใน DataTable
            return {
              id,
              customerName,
              activityTitle,
              price,
              statusText,
              evidence,
              bookedAt,
              __rawStatus: item?.status ?? null, // เก็บสถานะดิบไว้ด้วย (สำหรับ filter หรือ logic ภายหลัง)
            };
          });

          accumulatedRows.push(...mappedPageRows); // เพิ่มข้อมูลของหน้านี้เข้าอาร์เรย์รวม

          if (!hasNext) break; // ถ้าไม่มีหน้าต่อไปแล้ว ให้ออกจากลูป
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

  /** -------------------- ฟิลเตอร์สถานะ + ค้นหา -------------------- */

  /*
   * คำอธิบาย : กรองข้อมูลตามสถานะ (เปรียบเทียบกับข้อความไทย)
   * Input  : rows (BookingRow[]), statusFilter (StatusValue)
   * Output : BookingRow[]
   */
  const statusFilteredRows = React.useMemo<BookingRow[]>(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((row) => row.statusText === statusFilter);
  }, [rows, statusFilter]);

  /*
   * คำอธิบาย : ค้นหาจากผลที่ผ่านการกรองสถานะแล้ว (full-text แบบง่าย)
   * Input  : statusFilteredRows (BookingRow[]), searchQuery (string)
   * Output : BookingRow[]
   */
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

      {/* แถบเครื่องมือ: ช่องค้นหา + ฟิลเตอร์สถานะ + ปุ่มคำขอคืนเงิน */}
      <div className="flex items-center gap-3">
        <div className="w-[320px] shrink-0">
          <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* ฟิลเตอร์สถานะ (ค่า value ตรงกับข้อความไทยที่แสดง) */}
        <FilterDropdown
          options={STATUS_OPTIONS.map(({ label, value }) => ({ label, value }))}
          selected={statusFilter}
          onChange={(val) => setStatusFilter(val as StatusValue)}
        />

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
