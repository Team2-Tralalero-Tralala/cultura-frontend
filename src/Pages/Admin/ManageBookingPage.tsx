/**
 * หน้า: จัดการการจอง (Admin)
 * คำอธิบาย :
 * - แสดงรายการการจองทั้งหมดของแพ็กเกจในชุมชน
 * - ตาราง: ชื่อผู้จอง / ชื่อกิจกรรม / ราคา / สถานะ / หลักฐาน / จัดการ
 * - รองรับค้นหา, กรองสถานะ, ปุ่มคำขอคืนเงิน
 * - ปุ่ม "อนุมัติ" และ "ปฏิเสธ" จะอัปเดตสถานะในฐานข้อมูลจริง
 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import {
  fetchBookingsByAdmin,
  updateBookingStatus,
} from "@/Libs/BookingHistoryService";
import type {
  BookingRow,
  Pagination,
  BookingAdminDtoFromApi,
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
 * - Column<BookingRow>[] : รายการคอลัมน์ที่ใช้กับ DataTable
 */
const makeColumns = (
  onApprove: (row: BookingRow) => void,
  onReject: (row: BookingRow) => void,
  onNavigate: (id: number) => void,
  onOpenSlip: (url: string) => void
): Column<BookingRow>[] => [
    {
      key: "touristName",
      header: "ชื่อผู้จอง",
      className: "min-w-[220px]",
      render: (bookingRow) => (
        <div
          onClick={() => onNavigate(bookingRow.id)}
          className="cursor-pointer text-black hover:underline"
        >
          {bookingRow.touristName}
        </div>
      ),
    },
    {
      key: "packageName",
      header: "ชื่อกิจกรรม",
      className: "min-w-[220px]",
      // render: (bookingRow) => (
      //   <div
      //     onClick={() => onNavigate(bookingRow.id)}
      //     className="cursor-pointer text-dark-green hover:underline"
      //   >
      //     {bookingRow.packageName}
      //   </div>
      // ),
    },
    {
      key: "totalPrice",
      header: "ราคา",
      className: "min-w-[120px] text-left pl-4",
      render: (bookingRow) => <div className="text-left">{bookingRow.totalPrice}</div>,
    },
    {
      key: "status",
      header: "สถานะ",
      className: "min-w-[140px]",
      render: (bookingRow) => {
        const statusUpperCase = bookingRow.status?.toUpperCase();
        const statusMap: Record<string, string> = {
          PENDING: "รอตรวจสอบ",
          REFUND_PENDING: "รอคืนเงิน",
          BOOKED: "จองสำเร็จ",
          REJECTED: "ปฏิเสธจอง",
          REFUNDED: "คืนเงินแล้ว",
          REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
        };
        return <div>{statusMap[statusUpperCase ?? ""] ?? "-"}</div>;
      },
    },
    {
      key: "transferSlip",
      header: "หลักฐาน",
      className: "min-w-[180px]",
      render: (bookingRow) => {
        const slipPath = bookingRow.transferSlip ?? "-";

        if (!slipPath || slipPath === "-") {
          return <div>-</div>;
        }

        // ดึงชื่อไฟล์
        const fileName = slipPath.split("/").pop() ?? slipPath;

        return (
          <button
            type="button"
            onClick={() => onOpenSlip(slipPath)}
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
      render: (bookingRow) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => onReject(bookingRow)}
            className="w-[77px] h-[31px] text-[16px] rounded-[3px] border border-[#055035] bg-white text-[#696969] hover:bg-green-50 transition-colors duration-200"
          >
            ปฏิเสธ
          </button>

          <button
            onClick={() => onApprove(bookingRow)}
            className="w-[77px] h-[31px] text-[16px] rounded-[3px] bg-[#055035] text-white hover:bg-green-900 transition-colors duration-200"
          >
            อนุมัติ
          </button>
        </div>
      ),
    },
  ];

export default function ManageBookingAdmin() {
  const navigate = useNavigate();

  const [bookingRows, setBookingRows] = React.useState<BookingRow[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<BookingRow | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = React.useState(false);
  const [slipUrl, setSlipUrl] = React.useState<string | null>(null);

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");

  const openSlipModal = (url: string) => {
    if (!url || url === "-") return;
    setSlipUrl(url);
    setIsSlipModalOpen(true);
  };

  const closeSlipModal = () => {
    setIsSlipModalOpen(false);
    setSlipUrl(null);
  };

  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอตรวจสอบ", value: "PENDING" },
    { label: "รอคืนเงิน", value: "REFUND_PENDING" },
  ];

  /*
 * คำอธิบาย : โหลดข้อมูลการจองทั้งหมดจาก API
 * Input : currentPage, pageSize
 * Output : อัปเดต bookingRows และ pagination state
 */
  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const {
        data,
        pagination: paginationData,
      }: PaginationResponse<BookingAdminDtoFromApi> = await fetchBookingsByAdmin(
        currentPage,
        pageSize,
        debouncedSearch,
        statusFilter
      );

      const mappedBookings: BookingRow[] = data.map((booking) => {
        const rawSlip = booking.transferSlip;

        if (!rawSlip || rawSlip === "-") {
          return {
            id: booking.id ?? booking.bh_id,
            touristName: `${booking.tourist?.fname ?? ""} ${booking.tourist?.lname ?? ""}`.trim(),
            packageName: booking.package?.name ?? "-",
            totalPrice: `฿${(booking.totalPrice ?? 0).toLocaleString()}`,
            status: booking.status ?? "-",
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
          id: booking.id ?? booking.bh_id,
          touristName: `${booking.tourist?.fname ?? ""} ${booking.tourist?.lname ?? ""}`.trim(),
          packageName: booking.package?.name ?? "-",
          totalPrice: `฿${(booking.totalPrice ?? 0).toLocaleString()}`,
          status: booking.status ?? "-",
          transferSlip: fullUrl,
        };
      });

      setBookingRows(mappedBookings);
      setPagination(paginationData);
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  /*
  * คำอธิบาย : อนุมัติการจอง
  * Input : row (BookingRow)
  * Output : เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่
  */
  const handleApprove = async (row: BookingRow) => {
    try {
      setIsLoading(true);
      const currentStatus = row.status?.toUpperCase();
      const newStatus: "BOOKED" | "REFUNDED" =
        currentStatus === "PENDING" ? "BOOKED" : "REFUNDED";

      await updateBookingStatus(row.id, newStatus);
      await reload();

      // ตั้งค่าและเปิด ModalAlert
      setAlertType("success");
      if (currentStatus === "REFUND_PENDING") {
        setAlertTitle("อนุมัติการคืนเงินสำเร็จ");
        // setAlertMessage("");  <-- ถ้าว่างแบบนี้ปุ่มจะเด้งขึ้น
        setAlertMessage("\u00A0"); // ใช้อันนี้แทน (มันคือ Non-breaking space หรือเคาะวรรค 1 ที)
      } else {
        setAlertTitle("อนุมัติการจองสำเร็จ");
        setAlertMessage("\u00A0");
      }
      setAlertOpen(true);

    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("ไม่สามารถอนุมัติได้");
    } finally {
      setIsLoading(false);
    }
  };

  /*
  * คำอธิบาย : ปฏิเสธการจอง (ต้องมีเหตุผลเมื่อปฏิเสธ)
  * Input : row (BookingRow), reason (string)
  * Output : เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่
  */
  const handleReject = async (row: BookingRow, reason?: string) => {
    try {
      setIsLoading(true);
      const currentStatus = row.status?.toUpperCase();
      const newStatus: "REJECTED" | "REFUND_REJECTED" =
        currentStatus === "PENDING" ? "REJECTED" : "REFUND_REJECTED";

      await updateBookingStatus(row.id, newStatus, reason);
      await reload();
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("ไม่สามารถปฏิเสธได้");
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectModal = (row: BookingRow) => {
    setSelectedRow(row);
    setIsRejectModalOpen(true);
  };

  const openApproveModal = (row: BookingRow) => {
    setSelectedRow(row);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumb
          current={{
            label: "จัดการการจอง",
            to: `/admin/bookings`,
            isFromSidebar: true,
          }}
        />
      </div>

      {/* ส่วนหัว */}
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold ">รายการการจอง</h1>

        <div className="flex items-center gap-2 w-full">
          {/* ช่องค้นหา */}
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {/* กรองสถานะ */}
          <FilterDropdown
            options={statusOptions}
            selected={statusFilter}
            onChange={setStatusFilter}
          />

          {/* ปุ่มคำขอคืนเงิน */}
          <div className="ml-auto">
            <Button
              type="confirm-admin"
              onClick={() => navigate("/admin/booking/refunds")}
            >
              คำขอคืนเงิน
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* ตาราง */}
      <DataTable<BookingRow>
        data={bookingRows}
        columns={makeColumns(
          openApproveModal,
          openRejectModal,
          (id) => navigate(`/admin/booking/${id}`),
          openSlipModal
        )}
        getKey={(row: BookingRow) => String(row.id)}
        selectable
        theme="brand"
        isLoading={isLoading}
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalCount: pagination.totalCount,
          limit: pagination.limit,
        }}
        onPageChange={(page) => setCurrentPage(page)}
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
          } catch (err) {
            console.error(err);
          }
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setSelectedRow(null);
        }}
      />

      <ModalAlert
        isOpen={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      {/* Modal: ปฏิเสธ + กรอกเหตุผล */}
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
              onClick={closeSlipModal}
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
