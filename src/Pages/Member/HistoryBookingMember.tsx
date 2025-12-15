import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import type { Column, Pagination } from "@/Components/Tables/Types";

// Service
import { getMemberBookingHistories } from "@/Services/booking-service";

/* --- Constants & Types --- */

// Maps API status strings to Thai labels
const STATUS_LABEL_TH: Record<string, string> = {
  PENDING: "รอตรวจสอบ",
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_PENDING: "รอคืนเงิน",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
};

// Dropdown options
const STATUS_OPTIONS = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "รอตรวจสอบ", value: "PENDING" },
  { label: "จองสำเร็จ", value: "BOOKED" },
  { label: "ปฏิเสธการจอง", value: "REJECTED" },
  { label: "รอคืนเงิน", value: "REFUND_PENDING" },
  { label: "คืนเงินแล้ว", value: "REFUNDED" },
  { label: "ปฏิเสธการคืนเงิน", value: "REFUND_REJECTED" },
] as const;

// Row data shape for the DataTable
type BookingRow = {
  id: number;
  bookerName: string;
  eventName: string;
  totalPrice: string;
  status: string;    
  evidence: string;   
  bookedAt: string;   
  rawStatus: string;  
};

// Response shape from your service
type ServiceResponse = {
  data: {
    data: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
};

/* --- Helpers --- */

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount);
};

const formatThaiDateTime = (iso: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapApiToRow = (item: any): BookingRow => {
  const bookerName = item.bookerName ?? `${item.tourist?.fname ?? ''} ${item.tourist?.lname ?? ''}`.trim();
  const eventName = item.eventName ?? item.package?.name ?? '-';
  const totalPrice = formatCurrency(item.totalPrice || 0);
  
  const rawStatus = (item.status ?? "").toUpperCase();
  const statusLabel = STATUS_LABEL_TH[rawStatus] ?? rawStatus;

  // Slip logic: just return text, no link
  const slipUrl = item.slipUrl ?? item.transferSlip;
  const evidence = slipUrl ? "slip.jpg" : "-"; // Or show filename if you parse it

  const bookedAt = formatThaiDateTime(item.bookingDate ?? item.created_at);

  return {
    id: item.id,
    bookerName,
    eventName,
    totalPrice,
    status: statusLabel,
    evidence,
    bookedAt,
    rawStatus
  };
};

// Column definitions
const columns: Column<BookingRow>[] = [
  { key: "bookerName", header: "ชื่อผู้จอง", className: "min-w-[150px]" },
  { key: "eventName", header: "ชื่อกิจกรรม", className: "min-w-[200px]" },
  { key: "totalPrice", header: "ราคา", className: "min-w-[100px]" },
  { key: "status", header: "สถานะ", className: "min-w-[140px]" },
  { key: "evidence", header: "หลักฐาน", className: "min-w-[120px]" },
  { key: "bookedAt", header: "เวลา", className: "min-w-[180px]" },
];

/* --- Main Component --- */

export default function HistoryBookingMember() {
  const navigate = useNavigate();

  // Data State
  const [tableRows, setTableRows] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Load data from API
   */
  const loadPageData = useCallback(async (p: number, l: number) => {
    setIsLoading(true);
    try {
      // NOTE: We send "ALL" to the API to get everything for the current page,
      // then we might filter client-side if that's the desired behavior (like the admin example).
      // However, usually API filtering is better.
      // Based on your admin code, it seems you fetch by page and then filter the *current page's* results?
      // Or does the API support status param? Your service does support it.
      // Let's pass the status to the API for efficiency if possible.
      
      const statusParam = selectedStatus === "ALL" ? "ALL" : selectedStatus;
      
      const res = await getMemberBookingHistories(p, l, statusParam);
      
      // Access the nested data structure safely
      const rawList = res.data?.data?.data ?? [];
      const pag = res.data?.data?.pagination ?? {};

      const mappedRows = rawList.map(mapApiToRow);
      setTableRows(mappedRows);

      setTotalPages(pag.totalPages ?? 1);
      setTotalCount(pag.totalCount ?? 0);

    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]); // Re-create function if status changes to fetch new filtered data

  // Initial Load & on Page/Limit/Status change
  useEffect(() => {
    loadPageData(page, limit);
  }, [page, limit, loadPageData]);

  /**
   * Filter rows (Client-side Search)
   */
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    
    // Status is handled by API reload in useEffect, so we just filter by search query here
    if (!q) return tableRows;

    return tableRows.filter((row) => 
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [tableRows, searchQuery]);

  const getRowKey = (row: BookingRow) => row.id.toString();

  const paginationConfig: Pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          current={{
            label: "ประวัติการจอง",
            to: `/member/bookings-histories`, // Check your route path has 's' or not
          }}
        />
        <h1 className="text-xl font-semibold text-gray-800">ประวัติการจอง</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SearchBarTable 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            
            <FilterDropdown
              options={STATUS_OPTIONS as unknown as { label: string; value: string }[]}
              selected={selectedStatus}
              onChange={(v) => {
                setSelectedStatus(v);
                setPage(1); // Reset to page 1 on filter change
              }}
            />
          </div>

          <div>
            <Button type="confirm-admin" onClick={() => navigate("/member/refund-requests")}>
              คำขอคืนเงิน
            </Button>
          </div>
        </div>

        <DataTable<BookingRow>
          data={filteredRows}
          getKey={getRowKey}
          columns={columns}
          theme="brand"
          pagination={paginationConfig}
          isLoading={isLoading}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(v) => {
            setLimit(v);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
          selectable={false}
        />
      </div>
    </div>
  );
}