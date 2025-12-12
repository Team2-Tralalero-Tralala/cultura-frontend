/**
 * คำอธิบาย : Component สำหรับจัดการคำขอคืนเงินของสมาชิก (Member)
 * รวมถึงการแสดงรายการ อนุมัติ และปฏิเสธคำขอคืนเงิน พร้อมดูหลักฐานการโอน
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Components
import DataTable from "@/Components/Tables/DataTable";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";

// Services
import {
  fetchRefundRequestsMember,
  approveRefundMember,
  rejectRefundMember,
} from "@/Services/booking-service";

// Types
import type { Column } from "@/Components/Tables/Types";

type RefundRow = {
  id: number;
  touristName: string;
  packageName: string;
  totalPrice: string;
  status: string;
  transferSlip: string;
};

/**
 * คำอธิบาย : ฟังก์ชันสำหรับจัดรูปแบบ URL ของรูปภาพสลิปการโอนเงิน
 * รองรับทั้งแบบ Full URL และ Relative Path
 * Input : path (string | null) - ที่อยู่ของไฟล์รูปภาพ (เช่น "uploads/slip.jpg" หรือ "http://...")
 * Output : string | null - URL เต็มของรูปภาพสำหรับแสดงผล หรือ null หากไม่มีข้อมูล
 */
const getSlipImageUrl = (path: string | null): string | null => {
  if (!path || path === "-") return null;

  let cleanPath = path.replace(/\\/g, "/");
  if (cleanPath.startsWith("http")) return cleanPath;
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

  const fileBaseUrl = import.meta.env.VITE_FILE_URL;
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (fileBaseUrl) return `${fileBaseUrl}/${cleanPath}`;
  const prefix = cleanPath.startsWith("uploads") ? "" : "uploads/";
  return `${apiBaseUrl}/${prefix}${cleanPath}`;
};

/**
 * คำอธิบาย : กำหนดโครงสร้างคอลัมน์ (Column Definition) สำหรับ DataTable
 */
const makeColumns = (
  onApprove: (row: RefundRow) => void,
  onReject: (row: RefundRow) => void,
  onNavigate: (id: number) => void,
  onOpenSlip: (url: string) => void
): Column<RefundRow>[] => [
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
    header: "ราคารวม",
    className: "min-w-[120px] text-left pl-4",
    render: (row) => <div className="text-left">{row.totalPrice}</div>,
  },
  {
    key: "status",
    header: "สถานะ",
    className: "min-w-[140px]",
    render: (row) => {
      const statusTextMap: Record<string, string> = {
        REFUND_PENDING: "รอคืนเงิน",
        REFUNDED: "อนุมัติแล้ว",
        REFUND_REJECTED: "ปฏิเสธแล้ว",
      };
      // จัดการกรณี Case Sensitive ของสถานะ
      const statusKey = row.status?.toUpperCase() || "";
      return <div>{statusTextMap[statusKey] ?? row.status}</div>;
    },
  },
  {
    key: "transferSlip",
    header: "หลักฐาน",
    className: "min-w-[180px]",
    render: (row) => {
      const fullUrl = getSlipImageUrl(row.transferSlip);
      if (!fullUrl) return <div>-</div>;

      const fileName = row.transferSlip.split("/").pop() ?? "หลักฐานการโอน";

      return (
        <button
          type="button"
          onClick={() => onOpenSlip(fullUrl)}
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
    header: <div className="text-center w-full">จัดการ</div>,
    className: "w-[200px] text-center pr-2",
    render: (row) => {
      const isPending = row.status?.toUpperCase() === "REFUND_PENDING";
      return isPending ? (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => onReject(row)}
            className="w-[77px] h-[31px] text-[16px] rounded-md border border-[#4A816F] bg-white text-[#4A816F] hover:bg-[#E6F0EC]"
          >
            ปฏิเสธ
          </button>
          <button
            onClick={() => onApprove(row)}
            className="w-[77px] h-[31px] text-[16px] rounded-md bg-[#4A816F] text-white hover:bg-[#3B6D5D]"
          >
            อนุมัติ
          </button>
        </div>
      ) : (
        <div className="text-gray-400 text-center">-</div>
      );
    },
  },
];

export function ManageRefundBookingMember() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<RefundRow[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isRejectOpen, setRejectOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RefundRow | null>(null);

  const [isSlipOpen, setSlipOpen] = useState(false);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);

  /**
   * คำอธิบาย : ดึงข้อมูลคำขอคืนเงินจาก API และอัปเดตตาราง
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // เรียก API Admin
      const response = await fetchRefundRequestsMember(currentPage, pageSize);
      // responseBody = ส่วนข้อมูลหลักที่ได้จาก response
      const responseBody = response.data?.data || response.data;
      // refundRequests = รายการคำขอคืนเงินที่เป็น Array
      const refundRequests = Array.isArray(responseBody?.data)
        ? responseBody.data
        : Array.isArray(responseBody)
        ? responseBody
        : [];
      // paginationInfo = ข้อมูลเกี่ยวกับการแบ่งหน้า
      const paginationInfo = responseBody?.pagination || response.data?.pagination || {};

      const mappedRows: RefundRow[] = refundRequests.map((item: any) => ({
        id: item.id,
        touristName: `${item.tourist?.fname ?? ""} ${item.tourist?.lname ?? ""}`.trim(),
        packageName: item.package?.name ?? "-",
        totalPrice: `฿${(
          (item.package?.price ?? 0) * (item.totalParticipant ?? 1)
        ).toLocaleString()}`,
        status: item.status,
        transferSlip: item.transferSlip || "-",
      }));

      setRows(mappedRows);
      setPagination({
        currentPage: paginationInfo.currentPage ?? currentPage,
        totalPages: paginationInfo.totalPages ?? 1,
        totalCount: paginationInfo.totalCount ?? refundRequests.length,
        limit: paginationInfo.limit ?? pageSize,
      });
    } catch (error: any) {
      setErrorMessage(error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredRows = useMemo(() => {
    const keyword = searchQuery.toLowerCase();
    return rows.filter((row) =>
      [row.touristName, row.packageName, row.status].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [rows, searchQuery]);

  /**
   * คำอธิบาย : ดำเนินการอนุมัติคำขอคืนเงิน
   */
  const handleApprove = async (row: RefundRow) => {
    try {
      setIsLoading(true);
      await approveRefundMember(row.id);
      await reload();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "อนุมัติไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย : ดำเนินการปฏิเสธคำขอคืนเงินพร้อมเหตุผล
   */
  const handleReject = async (row: RefundRow, reason?: string) => {
    try {
      setIsLoading(true);
      await rejectRefundMember(row.id, reason || "");
      await reload();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "ปฏิเสธไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () =>
      makeColumns(
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
      ),
    [navigate]
  );

  return (
    <div className="space-y-4">
      <Breadcrumb
        current={{
          label: "คำขอคืนเงิน",
          to: "/member/bookings/refunded-pending",
        }}
      />

      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-[20px] font-bold text-black">คำขอคืนเงิน</h1>
        <div className="flex items-center gap-2 w-full">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {errorMessage}
        </div>
      )}

      <DataTable<RefundRow>
        data={filteredRows}
        columns={columns}
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

      {/* Modal ยืนยันการอนุมัติ */}
      <Modal
        open={isConfirmOpen}
        title="ยืนยันการอนุมัติคำขอคืนเงิน"
        text={
          selectedRow ? `ต้องการอนุมัติคำขอคืนเงินของ “${selectedRow.touristName}” ใช่หรือไม่` : ""
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          if (!selectedRow) return;
          const row = selectedRow;
          setConfirmOpen(false);
          await handleApprove(row);
          setSelectedRow(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal ปฏิเสธคำขอ */}
      <RejectModal
        open={isRejectOpen}
        title="ปฏิเสธคำขอคืนเงิน"
        text="กรุณากรอกเหตุผลการปฏิเสธคำขอคืนเงิน"
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => {
          if (!selectedRow) return;
          const row = selectedRow;
          setRejectOpen(false);
          await handleReject(row, reason);
          setSelectedRow(null);
        }}
        onCancel={() => {
          setRejectOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal แสดงรูปภาพสลิป */}
      {isSlipOpen && slipUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
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
                setSlipOpen(false);
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
