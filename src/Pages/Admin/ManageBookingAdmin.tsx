/**
 * หน้า: จัดการการจอง (Admin)
 * คำอธิบาย :
 *   - แสดงรายการการจองทั้งหมดของแพ็กเกจในชุมชน
 *   - ตาราง: ชื่อผู้จอง / ชื่อกิจกรรม / ราคา / สถานะ / หลักฐาน / จัดการ
 *   - รองรับค้นหา, กรองสถานะ, ปุ่มคำขอคืนเงิน
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
import { fetchBookingsByAdmin } from "@/Services/booking-history-service";
import type { BookingRow, Pagination } from "@/Types/BookingAdmin";
import type { BookingAdminDtoFromApi } from "@/Types/BookingAdmin";
import type { PaginationResponse } from "@/Types/Community";

/* --------------------------- Columns --------------------------- */
const makeColumns = (
  onApprove: (row: BookingRow) => void,
  onReject: (row: BookingRow) => void,
  onNavigate: (id: number) => void
): Column<BookingRow>[] => [
    {
      key: "touristName",
      header: "ชื่อผู้จอง",
      className: "min-w-[220px]",
      render: (r) => (
        <div
          onClick={() => onNavigate(r.id)}
          className="cursor-pointer text-dark-green hover:underline"
        >
          {r.touristName}
        </div>
      ),
    },
    {
      key: "packageName",
      header: "ชื่อกิจกรรม",
      className: "min-w-[220px]",
      render: (r) => (
        <div
          onClick={() => onNavigate(r.id)}
          className="cursor-pointer text-dark-green hover:underline"
        >
          {r.packageName}
        </div>
      ),
    },
    {
      key: "totalPrice",
      header: "ราคา",
      // ปรับให้ข้อความราคา (฿1,000) ชิดซ้ายของ cell และตรงกับหัวข้อ "ราคา"
      className: "min-w-[120px] text-left pl-4",
      render: (r) => <div className="text-left">{r.totalPrice}</div>,
    },
    {
      key: "status",
      header: "สถานะ",
      className: "min-w-[140px]",
      render: (r) => {
        const status = r.status?.toUpperCase();
        const map: Record<string, string> = {
          BOOKED: "รอตรวจสอบ",
          REFUND_PENDING: "รอคืนเงิน",
        };
        return <div>{map[status ?? ""] ?? "-"}</div>;
      },
    },
    {
      key: "transferSlip",
      header: "หลักฐาน",
      className: "min-w-[180px]",
      render: (r) => <div>{r.transferSlip ?? "-"}</div>,
    },
    {
      key: "actions",
      header: (
        <div className="text-center w-full flex justify-center items-center">
          จัดการ
        </div>
      ),
      // จัด header และปุ่มให้ตรงกลางแนวเดียวกัน
      className: "w-[200px] text-center pr-2",
      render: (r) => (
        <div className="flex justify-center items-center gap-3">
          <div className="w-[76px] [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
            <Button type="cancel" onClick={() => onReject(r)}>
              ปฏิเสธ
            </Button>
          </div>
          <div className="w-[76px] [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
            <Button type="confirm-admin" onClick={() => onApprove(r)}>
              อนุมัติ
            </Button>
          </div>
        </div>
      ),
    },
  ];

/* -------------------------- Component -------------------------- */

export default function ManageBookingAdmin() {
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<BookingRow[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // modal states
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<BookingRow | null>(null);

  // ตัวเลือกสถานะ
  const statusOptions = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอตรวจสอบ", value: "BOOKED" },
    { label: "รอคืนเงิน", value: "REFUND_PENDING" },
    // { label: "คืนเงินแล้ว", value: "REFUNDED" },
    // { label: "ปฏิเสธการคืนเงิน", value: "CANCELLED" },
  ];

  /** โหลดข้อมูลทั้งหมด */
  const reload = React.useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // เรียก API ครั้งเดียว พร้อมระบุ type
      const { data, pagination: pg }: PaginationResponse<BookingAdminDtoFromApi> =
        await fetchBookingsByAdmin(currentPage, pageSize);

      const mapped: BookingRow[] = data.map((b) => ({
        id: b.id ?? b.bh_id,
        touristName: `${b.tourist?.fname ?? ""} ${b.tourist?.lname ?? ""}`.trim(),
        packageName: b.package?.name ?? "-",
        totalPrice: `฿${(b.totalPrice ?? 0).toLocaleString()}`,
        status: b.status ?? "-",
        transferSlip: b.transferSlip ?? "-",
      }));

      setRows(mapped);
      setPagination(pg);
    } catch (error) {
      // ตรวจสอบชนิดของ error แบบ Type-safe
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);



  React.useEffect(() => {
    reload();
  }, [reload, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  /** อนุมัติ */
  const handleApprove = async (row: BookingRow) => {
    try {
      setIsLoading(true);
      console.log("อนุมัติ booking:", row.id);
      await reload();
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ไม่สามารถอนุมัติได้");
      setIsLoading(false);
    }
  };

  /** modal handler */
  const openRejectModal = (row: BookingRow) => {
    setSelectedRow(row);
    setRejectOpen(true);
  };
  const openApproveModal = (row: BookingRow) => {
    setSelectedRow(row);
    setConfirmOpen(true);
  };
  const handleReject = openRejectModal;

  /** กรองข้อมูล */
  const filteredRows = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = rows.filter((r) =>
      [r.touristName, r.packageName, r.status].some((val) =>
        val.toLowerCase().includes(q)
      )
    );

    if (statusFilter === "all") return filtered;
    return filtered.filter((r) => r.status === statusFilter);
  }, [rows, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* ส่วนหัว */}
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sm">จัดการการจอง</h2>
        <h1 className="text-xl">รายการการจองทั้งหมด</h1>

        <div className="flex items-center gap-2 w-full">
          {/* ช่องค้นหา */}
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onClick={() => navigate("/admin/refund-requests")}
            >
              คำขอคืนเงิน
            </Button>
          </div>
        </div>
      </div>

      {/* ข้อความผิดพลาด */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* ตาราง */}
      <DataTable<BookingRow>
        data={filteredRows}
        columns={makeColumns(openApproveModal, handleReject, (id) =>
          navigate(`/admin/booking/${id}`)
        )}
        getKey={(r: BookingRow) => String(r.id)}
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
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* Modal: ยืนยันอนุมัติ */}
      <Modal
        open={confirmOpen}
        title="ยืนยันการอนุมัติ"
        text={
          selectedRow
            ? `ต้องการอนุมัติการจองของ “${selectedRow.touristName}” ใช่หรือไม่`
            : "ต้องการอนุมัติการจองนี้หรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          if (!selectedRow) return;
          try {
            await handleApprove(selectedRow);
          } finally {
            setConfirmOpen(false);
            setSelectedRow(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal: ปฏิเสธ + กรอกเหตุผล */}
      <RejectModal
        open={rejectOpen}
        title="ปฏิเสธการจอง"
        text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้จองทราบ"
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => {
          if (!selectedRow) return;
          try {
            setIsLoading(true);
            console.log("ปฏิเสธ booking:", selectedRow.id, "เหตุผล:", reason);
            await reload();
          } catch (e: any) {
            setErrorMessage(e?.message ?? "ไม่สามารถปฏิเสธได้");
          } finally {
            setIsLoading(false);
            setRejectOpen(false);
            setSelectedRow(null);
          }
        }}
        onCancel={() => {
          setRejectOpen(false);
          setSelectedRow(null);
        }}
      />
    </div>
  );
}
