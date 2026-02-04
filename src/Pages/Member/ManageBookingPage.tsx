/**
 * คำอธิบาย: หน้าจัดการการจอง (Member)
 * - แสดงรายการการจองของแพ็กเกจที่ Member ดูแลเอง
 * - โครงสร้างเหมือนหน้า Admin ทุกประการ
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import ModalReject from "@/Components/Modal/ModalReject";
import { fetchBookingsByMember, updateBookingStatusByMember } from "@/Libs/BookingHistoryService";
import type { BookingRow, Pagination, BookingAdminDtoFromApi } from "@/Types/Booking";
import type { PaginationResponse } from "@/Types/Community";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";

/**
 * คำอธิบาย: สร้างคอลัมน์สำหรับตารางรายการการจอง (รวมปุ่มจัดการ, ลิงก์ และสถานะ)
 * Input:
 * - onApprove (function): callback เมื่อคลิกปุ่ม "อนุมัติ"
 * - onReject (function): callback เมื่อคลิกปุ่ม "ปฏิเสธ"
 * - onNavigate (function): callback เมื่อคลิกชื่อผู้จอง / ชื่อกิจกรรม เพื่อไปหน้ารายละเอียด
 * - onOpenSlip (function): callback เมื่อคลิกเปิดสลิปโอนเงิน
 * Output: Column<BookingRow>[] (รายการคอลัมน์ที่ใช้กับ DataTable)
 */
const createColumns = (
  onApprove: (row: BookingRow) => void,
  onReject: (row: BookingRow) => void,
  onNavigate: (id: number) => void,
  onOpenSlip: (url: string) => void,
): Column<BookingRow>[] => [
  {
    key: "touristName",
    header: "ชื่อผู้จอง",
    className: "min-w-[220px]",
    render: (row) => (
      <div
        onClick={() => onNavigate(row.id)}
        className="cursor-pointer text-dark-green hover:underline"
      >
        {row.touristName}
      </div>
    ),
  },
  {
    key: "packageName",
    header: "ชื่อกิจกรรม",
    className: "min-w-[220px]",
    render: (row) => (
      <div
        onClick={() => onNavigate(row.id)}
        className="cursor-pointer text-dark-green hover:underline"
      >
        {row.packageName}
      </div>
    ),
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
      const statusTextMap: Record<string, string> = {
        PENDING: "รอตรวจสอบ",
        REFUND_PENDING: "รอคืนเงิน",
        BOOKED: "จองสำเร็จ",
        REJECTED: "ปฏิเสธจอง",
        REFUNDED: "คืนเงินแล้ว",
        REFUND_REJECTED: "ปฏิเสธการคืนเงิน",
      };
      return <div>{statusTextMap[row.status] ?? "-"}</div>;
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
          className="
            text-[#4A816F]
            underline underline-offset-2
            hover:text-[#2f5b49]
            max-w-[180px]
            truncate
            block
            text-left
          "
        >
          {fileName}
        </button>
      );
    },
  },
  {
    key: "actions",
    header: <div className="text-center w-full">จัดการ</div>,
    className: "w-[200px] text-center pr-2",
    render: (row) => (
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => onReject(row)}
          className="
            w-[77px]
            h-[31px]
            text-[16px]
            rounded-md
            border border-[#4A816F]
            bg-white
            text-[#4A816F]
            hover:bg-[#E6F0EC]
          "
        >
          ปฏิเสธ
        </button>

        <button
          onClick={() => onApprove(row)}
          className="
            w-[77px]
            h-[31px]
            text-[16px]
            rounded-md
            bg-[#4A816F]
            text-white
            hover:bg-[#3B6D5D]
          "
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
export default function ManageBookingPage() {
  const navigate = useNavigate();

  const [bookingLists, setBookingLists] = React.useState<BookingRow[]>([]); // เปลี่ยน rows เป็น bookingLists
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  // Modal ยืนยันการอนุมัติ/ปฏิเสธ
  const [isOpenConfirmModal, setIsOpenConfirmModal] = React.useState(false);
  const [isOpenRejectModal, setIsOpenRejectModal] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<BookingRow | null>(null);

  // Modal แสดงสลิปโอนเงิน
  const [isOpenSlipModal, setIsOpenSlipModal] = React.useState(false);
  const [slipUrl, setSlipUrl] = React.useState<string | null>(null);

  /**
   * คำอธิบาย: ตัวเลือกสถานะที่ใช้สำหรับ FilterDropdown
   */
  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอตรวจสอบ", value: "PENDING" },
    { label: "รอคืนเงิน", value: "REFUND_PENDING" },
  ];

  /**
   * คำอธิบาย: ดึงรายการการจองจาก API ตามหน้า, จำนวนต่อหน้า และสถานะ แล้ว map เป็น BookingRow
   * Input: currentPage, pageSize, selectedStatus
   * Output: - (อัปเดต state ของ bookingRows และ pagination)
   */
  const loadPageData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response: PaginationResponse<BookingAdminDtoFromApi> = await fetchBookingsByMember(
        currentPage,
        pageSize,
        selectedStatus === "all" ? undefined : selectedStatus,
      );

      const mappedRows: BookingRow[] = response.data.map((bookingItem: BookingAdminDtoFromApi) => {
        let normalizedSlipPath = (bookingItem.transferSlip ?? "").replace(/\\/g, "/");

        if (normalizedSlipPath && !normalizedSlipPath.startsWith("http")) {
          normalizedSlipPath = `${import.meta.env.VITE_FILE_URL}/${normalizedSlipPath}`;
        }

        return {
          id: bookingItem.id,
          touristName: `${bookingItem.tourist.fname} ${bookingItem.tourist.lname}`,
          packageName: bookingItem.package.name,
          totalPrice: `฿${bookingItem.totalPrice.toLocaleString()}`,
          status: bookingItem.status,
          transferSlip: normalizedSlipPath || "-",
        };
      });

      setBookingLists(mappedRows);
      setPagination({
        currentPage: response.pagination.currentPage ?? 1,
        limit: response.pagination.limit ?? 10,
        totalCount: response.pagination.totalCount ?? 0,
        totalPages: response.pagination.totalPages ?? 1,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus]);

  React.useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  /**
   * คำอธิบาย: อนุมัติการจอง หรืออนุมัติคำขอคืนเงิน แล้วเรียก API และรีโหลดข้อมูล
   * Input: row (BookingRow)
   * Output: - (เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่)
   */
  const handleApprove = async (row: BookingRow) => {
    try {
      setIsLoading(true);

      const currentStatus = row.status?.toUpperCase();
      const newStatus: "BOOKED" | "REFUNDED" = currentStatus === "PENDING" ? "BOOKED" : "REFUNDED";

      await updateBookingStatusByMember(row.id, newStatus);
      await loadPageData();
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

  /**
   * คำอธิบาย: ปฏิเสธการจอง หรือปฏิเสธคำขอคืนเงิน พร้อมเหตุผล แล้วเรียก API และรีโหลดข้อมูล
   * Input: row (BookingRow), reason (string)
   * Output: - (เรียก API อัปเดตสถานะและโหลดข้อมูลใหม่)
   */
  const handleReject = async (row: BookingRow, reason?: string) => {
    try {
      setIsLoading(true);

      const currentStatus = row.status?.toUpperCase();
      const newStatus: "REJECTED" | "REFUND_REJECTED" =
        currentStatus === "PENDING" ? "REJECTED" : "REFUND_REJECTED";

      await updateBookingStatusByMember(row.id, newStatus, reason);
      await loadPageData();
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

  /**
   * คำอธิบาย: กรองข้อมูล bookingRows ตามคำค้นหาและสถานะ
   * Input: bookingRows, searchQuery, selectedStatus
   * Output: Array ของ BookingRow ที่ผ่านการกรอง
   */
  const filteredRows = React.useMemo(() => {
    const keyword = searchQuery.toLowerCase();

    const searchedRows = bookingLists.filter((row) =>
      [row.touristName, row.packageName, row.status].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );

    if (selectedStatus === "all") return searchedRows;
    return searchedRows.filter((row) => row.status === selectedStatus);
  }, [bookingLists, searchQuery, selectedStatus]);

  return (
    <div className="space-y-4">
      <BreadcrumbNavigation
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
            selected={selectedStatus}
            onChange={setSelectedStatus}
          />

          {/* ปุ่มคำขอคืนเงิน */}
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

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<BookingRow>
        data={filteredRows}
        columns={createColumns(
          (row) => {
            setSelectedRow(row);
            setIsOpenConfirmModal(true);
          },
          (row) => {
            setSelectedRow(row);
            setIsOpenRejectModal(true);
          },
          (id) => navigate(`/member/booking/${id}`),
          (url) => {
            setSlipUrl(url);
            setIsOpenSlipModal(true);
          },
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
        isOpen={isOpenConfirmModal}
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

          // ปิด modal + เคลียร์ state ก่อน
          setIsOpenConfirmModal(false);
          setSelectedRow(null);

          try {
            await handleApprove(row);
          } catch (error) {
            console.error(error);
          }
        }}
        onCancel={() => {
          setIsOpenConfirmModal(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal: ปฏิเสธ + กรอกเหตุผล */}
      <ModalReject
        isOpen={isOpenRejectModal}
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

          // ปิด modal + เคลียร์ state ก่อน
          setIsOpenRejectModal(false);
          setSelectedRow(null);

          try {
            await handleReject(row, reason);
          } catch (error) {
            console.error(error);
          }
        }}
        onCancel={() => {
          setIsOpenRejectModal(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal: แสดงรูปหลักฐานการโอน (แบบเต็มจอ) */}
      {isOpenSlipModal && slipUrl && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
          {/* กล่อง modal ขนาดคงที่ */}
          <div
            className="
              relative
              bg-[#E5E5E5]/70
              rounded-[24px]
              shadow-lg
              w-[650px]
              h-[650px]
              max-w-[95vw]
              max-h-[90vh]
              flex
              items-center
              justify-center
            "
          >
            {/* ปุ่มปิด */}
            <button
              type="button"
              onClick={() => {
                setIsOpenSlipModal(false);
                setSlipUrl(null);
              }}
              className="
                absolute
                right-4
                top-3
                text-2xl
                text-gray-700
                hover:text-black
              "
            >
              ×
            </button>

            {/* โซนรูป */}
            <div className="w-full h-full p-6 flex items-center justify-center">
              <img
                src={slipUrl}
                alt="หลักฐานการโอน"
                className="
                  max-w-full
                  max-h-full
                  object-contain
                  rounded-[16px]
                  bg-white
                "
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
