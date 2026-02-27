/**
 * หน้า: จัดการการจอง (Member)
 * คำอธิบาย :
 * - แสดงรายการการจองของแพ็กเกจที่ Member ดูแลเอง
 * - โครงสร้างเหมือนหน้า Admin ทุกประการ
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import {
  fetchBookingsByMember,
  updateBookingStatusByMember,
} from "@/Libs/BookingHistoryService";
import type {
  BookingMemberRow,
  Pagination,
  BookingMemberDtoFromApi,
} from "@/Types/Booking";
import type { PaginationResponse } from "@/Types/Community";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiUrl = import.meta.env.VITE_API_URL || "";
const backendBaseUrl = apiUrl.replace(/\/api$/, "");

/*
 * คำอธิบาย : Custom Hook สำหรับชะลอการอัปเดตค่า (Debounce) ช่วยลดการเรียก API ถี่เกินไปในขณะที่ค่า value เปลี่ยนแปลงต่อเนื่อง (เช่น การพิมพ์ค้นหา)
 * Input :
 * - value (T) : ค่าที่ต้องการหน่วงเวลา
 * - delay (number) : ระยะเวลาที่ต้องการหน่วง (หน่วย milliseconds)
 * Output : ค่าล่าสุดที่ผ่านการหน่วงเวลาแล้ว (Debounced Value)
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/*
 * คำอธิบาย : สร้างคอลัมน์สำหรับตารางรายการการจอง (รวมปุ่มจัดการ, ลิงก์ และสถานะ)
 * Input :
 * - onApprove (function) : callback เมื่อคลิกปุ่ม "อนุมัติ"
 * - onReject (function)  : callback เมื่อคลิกปุ่ม "ปฏิเสธ"
 * - onNavigate (function)    : callback เมื่อคลิกชื่อผู้จอง / ชื่อกิจกรรม เพื่อไปหน้ารายละเอียด
 * - onOpenSlip (function)    : callback เมื่อคลิกเปิดสลิปโอนเงิน
 * Output :
 * - Column<BookingMemberRow>[] : รายการคอลัมน์ที่ใช้กับ DataTable
 */
const makeColumns = (
  onApprove: (row: BookingMemberRow) => void,
  onReject: (row: BookingMemberRow) => void,
  onNavigate: (id: number) => void,
  onOpenSlip: (url: string) => void
): Column<BookingMemberRow>[] => [
    {
      key: "touristName",
      header: "ชื่อผู้จอง",
      className: "min-w-[220px]",
      render: (row) => (
        <div
          onClick={() => onNavigate(row.id)}
          className="cursor-pointer text-black hover:underline" // เปลี่ยนสีให้เหมือน Admin
        >
          {row.touristName}
        </div>
      ),
    },
    {
      key: "packageName",
      header: "ชื่อกิจกรรม",
      className: "min-w-[220px]",
    },
    {
      key: "totalPrice",
      header: "ราคา",
      className: "min-w-[120px] text-left pl-4",
      render: (row) => <div className="text-left">{row.totalPrice}</div>,
    },
    {
      key: "status",
      header: "สถานะ",
      className: "min-w-[140px]",
      render: (row) => {
        const statusUpperCase = row.status?.toUpperCase();
        const statusTextMap: Record<string, string> = {
          PENDING: "รอตรวจสอบ",
          REFUND_PENDING: "รอคืนเงิน",
          BOOKED: "จองสำเร็จ",
          REJECTED: "ปฏิเสธจอง",
          REFUNDED: "คืนเงินแล้ว",
          REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
        };
        return <div>{statusTextMap[statusUpperCase ?? ""] ?? "-"}</div>;
      },
    },
    {
      key: "transferSlip",
      header: "หลักฐาน",
      className: "min-w-[180px]",
      render: (row) => {
        const slipUrl = row.transferSlip ?? "-";
        if (!slipUrl || slipUrl === "-") {
          return <div>-</div>;
        }

        const fileName = slipUrl.split("/").pop() ?? slipUrl;

        return (
          <button
            type="button"
            onClick={() => onOpenSlip(slipUrl)}
            title={fileName}
            className="text-[#4A816F] underline underline-offset-2 hover:text-[#2f5b49] max-w-[180px] truncate block text-left"
          >
            {fileName}
          </button>
        );
      },
    },
    {
      key: "actions",
      header: (
        <div className="text-center w-full flex justify-center items-center">
          จัดการ
        </div>
      ),
      className: "w-[200px] text-center pr-2",
      render: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => onReject(row)}
            className="w-[77px] h-[31px] text-[16px] rounded-[3px] border border-[#055035] bg-white text-[#696969] hover:bg-green-50 transition-colors duration-200"
          >
            ปฏิเสธ
          </button>

          <button
            onClick={() => onApprove(row)}
            className="w-[77px] h-[31px] text-[16px] rounded-[3px] bg-[#055035] text-white hover:bg-green-900 transition-colors duration-200"
          >
            อนุมัติ
          </button>
        </div>
      ),
    },
  ];

/**
 * คำอธิบาย: หน้าสำหรับจัดการรายการการจองของแพ็กเกจที่ Member ดูแลเอง
 * Input: -
 * Output: JSX Element
 */
export function ManageBookingPage() {
  const navigate = useNavigate();

  const [bookingRows, setBookingRows] = React.useState<BookingMemberRow[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Modal ยืนยันการอนุมัติ/ปฏิเสธ
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<BookingMemberRow | null>(null);
  // Modal แสดงสลิปโอนเงิน
  const [isSlipModalOpen, setIsSlipModalOpen] = React.useState(false);
  const [slipUrl, setSlipUrl] = React.useState<string | null>(null);

  // เพิ่ม state สำหรับ ModalAlert
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");

  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอตรวจสอบ", value: "PENDING" },
    { label: "รอคืนเงิน", value: "REFUND_PENDING" },
  ];

  /*
   * คำอธิบาย : ดึงรายการการจองจาก API ตามหน้า, จำนวนต่อหน้า และสถานะ แล้ว map เป็น BookingMemberRow
   * Input : currentPage, pageSize, statusFilter
   * Output : อัปเดต state ของ bookingRows และ pagination
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response: PaginationResponse<BookingMemberDtoFromApi> =
        await fetchBookingsByMember(
          currentPage,
          pageSize,
          debouncedSearch,
          statusFilter
        );

      const mappedRows: BookingMemberRow[] = response.data.map(
        (bookingItem: BookingMemberDtoFromApi) => {
          const rawSlip = bookingItem.transferSlip;

          if (!rawSlip || rawSlip === "-") {
            return {
              id: bookingItem.id,
              touristName: `${bookingItem.tourist?.fname ?? ""} ${bookingItem.tourist?.lname ?? ""}`.trim(),
              packageName: bookingItem.package?.name ?? "-",
              totalPrice: `฿${(bookingItem.totalPrice ?? 0).toLocaleString()}`,
              status: bookingItem.status ?? "-",
              transferSlip: "-",
            };
          }

          let cleanedPath = rawSlip.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
          let fullUrl = cleanedPath;

          if (!cleanedPath.startsWith("http")) {
            if (!cleanedPath.startsWith("uploads/")) {
              fullUrl = `${backendBaseUrl}/uploads/${cleanedPath}`;
            } else {
              fullUrl = `${backendBaseUrl}/${cleanedPath}`;
            }
          }

          return {
            id: bookingItem.id,
            touristName: `${bookingItem.tourist?.fname ?? ""} ${bookingItem.tourist?.lname ?? ""}`.trim(),
            packageName: bookingItem.package?.name ?? "-",
            totalPrice: `฿${(bookingItem.totalPrice ?? 0).toLocaleString()}`,
            status: bookingItem.status ?? "-",
            transferSlip: fullUrl,
          };
        }
      );

      setBookingRows(mappedRows);
      setPagination(response.pagination);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  /*
  * คำอธิบาย : อนุมัติการจอง หรืออนุมัติคำขอคืนเงิน แล้วเรียก API และรีโหลดข้อมูล
  * Input : row (BookingMemberRow)
  * Output : เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่
  */
  const handleApprove = async (row: BookingMemberRow) => {
    try {
      setIsLoading(true);
      const currentStatus = row.status?.toUpperCase();
      const newStatus: "BOOKED" | "REFUNDED" =
        currentStatus === "PENDING" ? "BOOKED" : "REFUNDED";

      await updateBookingStatusByMember(row.id, newStatus);
      await reload();

      // เปิด ModalAlert หลังอนุมัติสำเร็จ
      setAlertType("success");
      if (currentStatus === "REFUND_PENDING") {
        setAlertTitle("อนุมัติการคืนเงินสำเร็จ");
        setAlertMessage("\u00A0"); // ใช้ \u00A0 เพื่อล็อคตำแหน่งปุ่ม
      } else {
        setAlertTitle("อนุมัติการจองสำเร็จ");
        setAlertMessage("\u00A0");
      }
      setAlertOpen(true);

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("ไม่สามารถอนุมัติได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
  * คำอธิบาย : ปฏิเสธการจอง หรือปฏิเสธคำขอคืนเงิน พร้อมเหตุผล แล้วเรียก API และรีโหลดข้อมูล
  * Input : row (BookingMemberRow), reason (string)
  * Output : เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่
  */
const handleReject = async (row: BookingMemberRow, reason?: string) => {
  try {
    setIsLoading(true);

    const currentStatus = row.status?.toUpperCase();

    const newStatus: "REJECTED" | "REFUND_REJECTED" =
      currentStatus === "PENDING"
        ? "REJECTED"
        : "REFUND_REJECTED";

    await updateBookingStatusByMember(row.id, newStatus, reason);
    await reload();

    setAlertType("success");

    if (currentStatus === "REFUND_PENDING") {
      setAlertTitle("ปฏิเสธการคืนเงินสำเร็จ");
      setAlertMessage("\u00A0");
    } else {
      setAlertTitle("ปฏิเสธการจองสำเร็จ");
      setAlertMessage("\u00A0");
    }

    setAlertOpen(true);

  } catch (error) {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("ไม่สามารถปฏิเสธได้");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="space-y-4">
      <Breadcrumb
        current={{
          label: "จัดการการจอง",
          to: "/member/bookings/all",
          isFromSidebar: true,
        }}
      />

      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">รายการการจอง</h1>

        <div className="flex items-center gap-2 w-full">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <FilterDropdown
            options={statusOptions}
            selected={statusFilter}
            onChange={setStatusFilter}
          />

          <div className="ml-auto">
            <Button
              type="confirm-admin"
              onClick={() => navigate("/member/bookings/refunded-pending")}
            >
              คำขอคืนเงิน
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      <DataTable<BookingMemberRow>
        data={bookingRows}
        columns={makeColumns(
          (row) => {
            setSelectedRow(row);
            setIsConfirmModalOpen(true);
          },
          (row) => {
            setSelectedRow(row);
            setIsRejectModalOpen(true);
          },
          (id) => navigate(`/member/booking/${id}`),
          (url) => {
            setSlipUrl(url);
            setIsSlipModalOpen(true);
          }
        )}
        getKey={(row) => String(row.id)}
        selectable
        theme="brand"
        isLoading={isLoading}
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modal: ยืนยันอนุมัติ */}
      <Modal
        isOpen={isConfirmModalOpen}
        title={
          selectedRow?.status?.toUpperCase() === "REFUND_PENDING"
            ? "ยืนยันการอนุมัติคำขอคืนเงิน"
            : "ยืนยันการอนุมัติการจอง"
        }
        text={
          selectedRow
            ? selectedRow.status?.toUpperCase() === "REFUND_PENDING"
              ? `ต้องการอนุมัติคำขอคืนเงินของ “${selectedRow.touristName}” ใช่หรือไม่`
              : `ต้องการอนุมัติการจองของ “${selectedRow.touristName}” ใช่หรือไม่`
            : "ต้องการดำเนินการนี้หรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          if (!selectedRow) return;
          const row = selectedRow;
          // ปิด Modal ยืนยันก่อน แล้วค่อยเรียก handleApprove
          setIsConfirmModalOpen(false);
          setSelectedRow(null);
          try {
            await handleApprove(row);
          } catch (error) {
            console.error(error);
          }
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* ModalAlert (แสดงหลังอนุมัติสำเร็จ) */}
      <ModalAlert
        isOpen={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      {/* Modal: ปฏิเสธ */}
      <RejectModal
        isOpen={isRejectModalOpen}
        title={
          selectedRow?.status?.toUpperCase() === "REFUND_PENDING"
            ? "ปฏิเสธคำขอคืนเงิน"
            : "ปฏิเสธการจอง"
        }
        text={
          selectedRow?.status?.toUpperCase() === "REFUND_PENDING"
            ? "กรุณากรอกเหตุผลการปฏิเสธคำขอคืนเงิน เพื่อส่งให้ผู้จองทราบ"
            : "กรุณากรอกเหตุผลการปฏิเสธการจอง เพื่อส่งให้ผู้จองทราบ"
        }
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => {
          if (!selectedRow) return;
          const row = selectedRow;
          try {
            await handleReject(row, reason);
          } finally {
            setIsRejectModalOpen(false);
            setSelectedRow(null);
          }
        }}
        onCancel={() => {
          setIsRejectModalOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal: แสดงรูปหลักฐาน */}
      {isSlipModalOpen && slipUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="relative bg-[#E5E5E5]/70 rounded-[24px] shadow-lg w-[650px] h-[650px] max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setIsSlipModalOpen(false);
                setSlipUrl(null);
              }}
              className="absolute right-4 top-3 text-2xl text-gray-700 hover:text-black"
            >
              ×
            </button>
            <div className="w-full h-full p-6 flex items-center justify-center">
              <img
                src={slipUrl}
                alt="หลักฐานการโอน"
                className="max-w-full max-h-full object-contain rounded-[16px] bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
