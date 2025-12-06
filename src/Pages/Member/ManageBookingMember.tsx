/**
 * หน้า: จัดการการจอง (Member)
 * คำอธิบาย :
 *   - แสดงรายการการจองของแพ็กเกจที่ Member ดูแลเอง
 *   - โครงสร้างเหมือนหน้า Admin ทุกประการ
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import {
  fetchBookingsByMember,
  updateBookingStatusByMember,
} from "@/Services/booking-history-service";
import type {
  BookingRow,
  Pagination,
  BookingAdminDtoFromApi,
} from "@/Types/BookingAdmin";
import type { PaginationResponse } from "@/Types/Community";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/* --------------------------- Columns --------------------------- */
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

/* -------------------------- Component -------------------------- */

export default function ManageBookingMember() {
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<BookingRow[]>([]);
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
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<BookingRow | null>(null);

  const [slipOpen, setSlipOpen] = React.useState(false);
  const [slipUrl, setSlipUrl] = React.useState<string | null>(null);

  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอตรวจสอบ", value: "PENDING" },
    { label: "รอคืนเงิน", value: "REFUND_PENDING" },
  ];

  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response: PaginationResponse<BookingAdminDtoFromApi> =
        await fetchBookingsByMember(
          currentPage,
          pageSize,
          statusFilter === "all" ? undefined : statusFilter
        );

      const mappedRows: BookingRow[] = response.data.map(
        (bookingItem: BookingAdminDtoFromApi) => {
          let normalizedSlipPath =
            (bookingItem.transferSlip ?? "").replace(/\\/g, "/");

          if (
            normalizedSlipPath &&
            !normalizedSlipPath.startsWith("http")
          ) {
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
        }
      );

      setRows(mappedRows);
      setPagination(response.pagination);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleApprove = async (row: BookingRow) => {
    const newStatus =
      row.status === "REFUND_PENDING" ? "REFUNDED" : "BOOKED";
    await updateBookingStatusByMember(row.id, newStatus);
    await reload();
  };

  const handleReject = async (row: BookingRow, reason?: string) => {
    const newStatus =
      row.status === "REFUND_PENDING"
        ? "REFUND_REJECTED"
        : "REJECTED";

    await updateBookingStatusByMember(row.id, newStatus, reason);
    await reload();
  };

  const filteredRows = React.useMemo(() => {
    const keyword = searchQuery.toLowerCase();

    const searchedRows = rows.filter((row) =>
      [row.touristName, row.packageName, row.status].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );

    if (statusFilter === "all") return searchedRows;
    return searchedRows.filter((row) => row.status === statusFilter);
  }, [rows, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      <Breadcrumb
        current={{
          label: "จัดการการจอง",
          to: "/member/bookings",
          fromSidebar: true,
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

          {/* ✅ ปุ่มคำขอคืนเงิน (ยังอยู่ครบ) */}
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

      <DataTable<BookingRow>
        data={filteredRows}
        columns={makeColumns(
          (row) => {
            setSelectedRow(row);
            setConfirmOpen(true);
          },
          (row) => {
            setSelectedRow(row);
            setRejectOpen(true);
          },
          (id) => navigate(`/member/booking/${id}`),
          (url) => {
            setSlipUrl(url);
            setSlipOpen(true);
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
        open={confirmOpen}
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
          if (selectedRow) {
            await handleApprove(selectedRow);
          }
          setConfirmOpen(false);
          setSelectedRow(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal: ปฏิเสธ */}
      <RejectModal
        open={rejectOpen}
        onConfirm={async (reason) => {
          if (selectedRow) {
            await handleReject(selectedRow, reason);
          }
          setRejectOpen(false);
          setSelectedRow(null);
        }}
        onCancel={() => {
          setRejectOpen(false);
          setSelectedRow(null);
        }}
      />
      {/* Modal: รูปสลิป */}
      {slipOpen && slipUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <div className="relative bg-[#E5E5E5] rounded-[24px] shadow-lg max-w-5xl w-[90%]">
            <button
              type="button"
              onClick={() => {
                setSlipOpen(false);
                setSlipUrl(null);
              }}
              className="absolute right-4 top-3 text-2xl"
            >
              ×
            </button>

            <div className="p-6 flex justify-center">
              <img
                src={slipUrl}
                alt="หลักฐานการโอน"
                className="max-h-[80vh] max-w-full rounded-[16px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
