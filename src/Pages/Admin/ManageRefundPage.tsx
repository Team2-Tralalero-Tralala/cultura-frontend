/**
 * คำอธิบาย : Component สำหรับจัดการคำขอคืนเงินของ Admin
 * รวมถึงการแสดงรายการ อนุมัติ และปฏิเสธคำขอคืนเงิน พร้อมดูหลักฐานการโอน
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Components
import DataTable from "@/Components/Tables/DataTable";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import ModalReject from "@/Components/Modal/ModalReject";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";

// Services
import { fetchRefundRequests, approveRefund, rejectRefund } from "@/Libs/BookingService";

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
 * คำอธิบาย: ฟังก์ชันสำหรับจัดรูปแบบ URL ของรูปภาพสลิปการโอนเงิน
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
 * คำอธิบาย: กำหนดโครงสร้างคอลัมน์ (Column Definition)
 */
const createColumns = (
  onApprove: (row: RefundRow) => void,
  onReject: (row: RefundRow) => void,
  onNavigate: (id: number) => void,
  onOpenSlip: (url: string) => void,
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

export default function ManageRefundPage() {
  const navigate = useNavigate();

  // Data States
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
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

  // Modal Flow States
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectReasonOpen, setIsRejectReasonOpen] = useState(false);
  const [isDoubleConfirmOpen, setIsDoubleConfirmOpen] = useState(false);
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<RefundRow | null>(null);
  const [tempReason, setTempReason] = useState("");

  // Slip Modal States
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetchRefundRequests(currentPage, pageSize);
      const responseBody = response.data?.data || response.data;
      const refundRequests = Array.isArray(responseBody?.data) ? responseBody.data : [];
      const paginationInfo = responseBody?.pagination || {};

      const mappedRows: RefundRow[] = refundRequests.map((item: any) => ({
        id: item.id,
        touristName: `${item.tourist?.fname ?? ""} ${item.tourist?.lname ?? ""}`.trim(),
        packageName: item.package?.name ?? "-",
        totalPrice: `฿${((item.package?.price ?? 0) * (item.totalParticipant ?? 1)).toLocaleString()}`,
        status: item.status,
        transferSlip: item.transferSlip || "-",
      }));

      setRefunds(mappedRows);
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
    fetchRefunds();
  }, [fetchRefunds]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    const keyword = searchQuery.toLowerCase();
    return refunds.filter((row) =>
      [row.touristName, row.packageName, row.status].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [refunds, searchQuery]);

  /** ดำเนินการอนุมัติ */
  const handleApprove = async (row: RefundRow) => {
    try {
      setIsLoading(true);
      await approveRefund(row.id);
      await fetchRefunds();
    } catch (error: any) {
      setErrorMessage(error.message || "อนุมัติไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /** ฟังก์ชันสำหรับปฏิเสธคำขอคืนเงิน */
  const executeReject = async () => {
    if (!selectedRow) return;
    try {
      setIsLoading(true);
      await rejectRefund(selectedRow.id, tempReason);
      setIsDoubleConfirmOpen(false);
      setIsSuccessAlertOpen(true);
      await fetchRefunds();
    } catch (error: any) {
      setErrorMessage(error.message || "ปฏิเสธไม่สำเร็จ");
      setIsDoubleConfirmOpen(false);
    } finally {
      setIsLoading(false);
      setSelectedRow(null);
      setTempReason("");
    }
  };

  const columns = useMemo(
    () =>
      createColumns(
        (row) => {
          setSelectedRow(row);
          setIsApproveConfirmOpen(true);
        },
        (row) => {
          setSelectedRow(row);
          setIsRejectReasonOpen(true);
        },
        (id) => navigate(`/admin/booking/${id}`),
        (url) => {
          setSlipUrl(url);
          setIsSlipModalOpen(true);
        },
      ),
    [navigate],
  );

  return (
    <div className="space-y-4">
      <Breadcrumb
        current={{
          label: "คำขอคืนเงิน",
          to: "/admin/booking/refunds",
        }}
      />

      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-[20px] font-bold text-black">คำขอคืนเงิน</h1>
        <div className="w-[260px]">
          <SearchBarTable
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
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
        pagination={pagination}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modal กรอกเหตุผลการปฏิเสธ */}
      <ModalReject
        isOpen={isRejectReasonOpen}
        title="ปฏิเสธคำขอคืนเงิน"
        text="กรุณากรอกเหตุผลการปฏิเสธคำขอคืนเงิน"
        onConfirm={(reason) => {
          setTempReason(reason);
          setIsRejectReasonOpen(false);
          setIsDoubleConfirmOpen(true);
        }}
        onCancel={() => {
          setIsRejectReasonOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal ยืนยันซ้ำ */}
      <Modal
        isOpen={isDoubleConfirmOpen}
        title="ปฏิเสธคำขอคืนเงินหรือไม่"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยันการปฏิเสธการจองนี้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={executeReject}
        onCancel={() => {
          setIsDoubleConfirmOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal Alert แจ้งสำเร็จ */}
      <ModalAlert
        isOpen={isSuccessAlertOpen}
        type="success"
        title="ปฏิเสธคำขอคืนเงินสำเร็จ"
        message="ข้อมูลการปฏิเสธถูกบันทึกเรียบร้อยแล้ว"
        onClose={() => setIsSuccessAlertOpen(false)}
      />

      {/* Modal ยืนยันการอนุมัติ */}
      <Modal
        isOpen={isApproveConfirmOpen}
        title="ยืนยันการอนุมัติคำขอคืนเงิน"
        text={selectedRow ? `ต้องการอนุมัติคำขอคืนเงินของ “${selectedRow.touristName}” ใช่หรือไม่` : ""}
        onConfirm={async () => {
          if (!selectedRow) return;
          setIsApproveConfirmOpen(false);
          await handleApprove(selectedRow);
          setSelectedRow(null);
        }}
        onCancel={() => {
          setIsApproveConfirmOpen(false);
          setSelectedRow(null);
        }}
      />

      {/* Modal แสดงรูปภาพสลิป */}
      {isSlipModalOpen && slipUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="relative bg-[#E5E5E5]/70 rounded-[24px] shadow-lg w-[650px] h-[650px] max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => {
                setIsSlipModalOpen(false);
                setSlipUrl(null);
              }}
              className="absolute right-4 top-3 text-2xl text-gray-700 hover:text-black"
            >
              ×
            </button>
            <div className="w-full h-full p-6 flex items-center justify-center">
              <img src={slipUrl} alt="หลักฐาน" className="max-w-full max-h-full object-contain rounded-[16px] bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}