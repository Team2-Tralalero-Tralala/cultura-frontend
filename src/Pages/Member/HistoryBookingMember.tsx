/**
 * คำอธิบาย: Component สำหรับแสดงประวัติการจองของผู้ใช้งานในระบบ (Booking History)
 * ประกอบด้วยตารางแสดงรายละเอียดการจอง, ระบบการค้นหา (Search), การกรองสถานะ (Filter) 
 * และการจัดการการแบ่งหน้า (Pagination) รวมถึง Modal สำหรับดูสลิปหลักฐาน
 */

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

/**
 * คำอธิบาย : ตัวแปรสำหรับ map ค่า status จาก API เป็นข้อความภาษาไทย
 */
const statusLabelTh: Record<string, string> = {
  PENDING: "รอตรวจสอบ",
  BOOKED: "จองสำเร็จ",
  REJECTED: "ปฏิเสธการจอง",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_PENDING: "รอคืนเงิน",
  REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
};

// Dropdown options 
const statusOptions = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "จองสำเร็จ", value: "BOOKED" },
  { label: "ปฏิเสธการจอง", value: "REJECTED" },
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
  fullSlipUrl: string | null; 
  bookedAt: string;   
  rawStatus: string;  
};

/* --- Helpers --- */

/**
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงค่าตัวเลขให้เป็นรูปแบบสกุลเงินบาทไทย (THB)
 * Input : amount (number)
 * Output : string
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount);
};

/**
 * คำอธิบาย : ฟังก์ชันสำหรับแปลง ISO string เป็นรูปแบบวันที่ไทย
 * Input : isoString (string)
 * Output : string
 */
const formatThaiDateTime = (isoString: string) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง URL เต็มของรูปภาพ (ดึง Logic มาจากหน้า Refund ของคุณ)
 * Input : path (string | null)
 * Output : string | null
 */
const getSlipImageUrl = (path: string | null): string | null => {
  if (!path || path === "-") return null;

  let cleanPath = path.replace(/\\/g, "/");
  if (cleanPath.startsWith("http")) return cleanPath;
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

  // ใช้ Env Variable ถ้ามี หรือใช้ Default Localhost
  const fileBaseUrl = import.meta.env.VITE_FILE_URL;
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"; 

  if (fileBaseUrl) return `${fileBaseUrl}/${cleanPath}`;
  
  // Logic การต่อ Path
  const prefix = cleanPath.startsWith("uploads") ? "" : "uploads/";
  return `${apiBaseUrl}/${prefix}${cleanPath}`;
};

/**
 * คำอธิบาย : ฟังก์ชันแปลงข้อมูล API เป็น Row Data
 * Input : item (any)
 * Output : BookingRow
 */
const mapApiToRow = (item: any): BookingRow => {
  const bookerName = item.bookerName ?? `${item.tourist?.fname ?? ''} ${item.tourist?.lname ?? ''}`.trim();
  const eventName = item.eventName ?? item.package?.name ?? '-';
  const totalPrice = formatCurrency(item.totalPrice || 0);
  
  const rawStatus = (item.status ?? "").toUpperCase();
  const statusLabel = statusLabelTh[rawStatus] ?? rawStatus;

  // Slip logic
  const slipPath = item.slipUrl ?? item.transferSlip;
  const evidence = slipPath ? slipPath.split('/').pop() || "view_slip" : "-";
  
  // สร้าง URL เต็มเตรียมไว้
  const fullSlipUrl = getSlipImageUrl(slipPath);

  const bookedAt = formatThaiDateTime(item.bookingDate ?? item.created_at);

  return {
    id: item.id,
    bookerName,
    eventName,
    totalPrice,
    status: statusLabel,
    evidence,
    fullSlipUrl,
    bookedAt,
    rawStatus
  };
};

/* --- Main Component --- */

/**
 * คำอธิบาย : Component สำหรับหน้าประวัติการจองของสมาชิก พร้อม Modal ดูรูปสลิป
 * Input : -
 * Output : JSX Element
 */
export default function HistoryBookingMember() {
  const navigate = useNavigate();

  // Data State
  const [tableRows, setTableRows] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false); // is... ตาม Standard 4.5
  
  // Modal State 
  const [isSlipOpen, setSlipOpen] = useState(false);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * คำอธิบาย : สร้าง Columns สำหรับ DataTable (ใช้ useMemo เพื่อให้เรียกฟังก์ชันเปิด Modal ได้)
   * Input : -
   * Output : Column Definition Array
   */
  const columns = useMemo<Column<BookingRow>[]>(() => [
    { key: "bookerName", header: "ชื่อผู้จอง", className: "min-w-[150px]" },
    { key: "eventName", header: "ชื่อกิจกรรม", className: "min-w-[200px]" },
    { key: "totalPrice", header: "ราคา", className: "min-w-[100px]" },
    { key: "status", header: "สถานะ", className: "min-w-[140px]" },
    { 
      key: "evidence", 
      header: "หลักฐาน", 
      className: "min-w-[120px]",
      render: (row: BookingRow) => (
        row.fullSlipUrl ? (
          <button
            type="button"
            onClick={() => {
              setPreviewSlipUrl(row.fullSlipUrl);
              setSlipOpen(true);
            }}
            className="text-[#4A816F] underline underline-offset-2 hover:text-[#2f5b49] cursor-pointer"
            title={row.evidence}
          >
            {row.evidence}
          </button>
        ) : (
          <span>-</span>
        )
      )
    },
    { key: "bookedAt", header: "เวลา", className: "min-w-[180px]" },
  ], []);

  /**
   * คำอธิบาย : โหลดข้อมูลประวัติการจองจาก API
   * Input : targetPage, currentLimit
   * Output : void
   */
  const loadPageData = useCallback(async (targetPage: number, currentLimit: number) => {
    setIsLoading(true);
    try {
      const statusParam = selectedStatus === "ALL" ? "ALL" : selectedStatus;
      
      const res = await getMemberBookingHistories(targetPage, currentLimit, statusParam);
      
      const rawList = res.data?.data?.data ?? [];
      const paginationData = res.data?.data?.pagination ?? {};

      const mappedRows = rawList.map(mapApiToRow);
      setTableRows(mappedRows);

      setTotalPages(paginationData.totalPages ?? 1);
      setTotalCount(paginationData.totalCount ?? 0);

    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadPageData(page, limit);
  }, [page, limit, loadPageData]);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับกรองรายการข้อมูลในตารางตามคำค้นหา (Client-side Search)
   * Input : tableRows (ข้อมูลแถวทั้งหมด), searchQuery (คำค้นหา)
   * Output : BookingRow[] (รายการข้อมูลที่ผ่านการกรองแล้ว)
   */
  const filteredRows = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return tableRows;
    return tableRows.filter((row) => 
      Object.values(row).join(" ").toLowerCase().includes(searchTerm)
    );
  }, [tableRows, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          current={{
            label: "ประวัติการจอง",
            to: `/member/bookings-histories`, 
          }}
        />
        <h1 className="text-xl font-semibold text-gray-800">ประวัติการจอง</h1>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SearchBarTable 
              value={searchQuery} 
              onChange={(event) => setSearchQuery(event.target.value)} 
            />
            
            <FilterDropdown
              options={statusOptions as any}
              selected={selectedStatus}
              onChange={(newStatus) => {
                setSelectedStatus(newStatus);
                setPage(1);
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
          getKey={(row) => row.id.toString()}
          columns={columns}
          theme="brand"
          pagination={{ currentPage: page, totalPages, totalCount, limit }}
          isLoading={isLoading}
          onPageChange={(targetPage) => setPage(targetPage)}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
          selectable={false}
        />
      </div>

      {/* Modal แสดงรูปภาพสลิป */}
      {isSlipOpen && previewSlipUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="relative bg-[#E5E5E5]/90 rounded-[24px] shadow-lg w-[650px] h-[650px] max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            {/* ปุ่มปิด */}
            <button
              type="button"
              onClick={() => {
                setSlipOpen(false);
                setPreviewSlipUrl(null);
              }}
              className="absolute right-4 top-3 text-2xl text-gray-700 hover:text-black font-bold z-10"
            >
              ×
            </button>

            {/* โซนรูป */}
            <div className="w-full h-full p-6 flex items-center justify-center">
              <img
                src={previewSlipUrl}
                alt="หลักฐานการโอน"
                className="max-w-full max-h-full object-contain rounded-[16px] bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}