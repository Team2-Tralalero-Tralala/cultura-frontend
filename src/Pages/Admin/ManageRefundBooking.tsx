/*
 * คำอธิบาย : หน้าแสดงรายการคำขอคืนเงินของชุมชน (Admin)
 * หน้าที่ :
 *   - แสดงตารางคำขอคืนเงินของนักท่องเที่ยวในชุมชนที่ตนดูแล
 *   - มีฟังก์ชันค้นหา / อนุมัติ / ปฏิเสธ (พร้อมกรอกเหตุผล)
 *   - รองรับการจัดการหลายรายการ (Bulk Action)
 * Input : ดึงข้อมูลจาก API โดยตรง
 * Output : ตารางคำขอคืนเงินพร้อม Pagination, Modal, และการอัปเดตสถานะ
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/Index";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import type { Column, BulkAction, Pagination } from "@/Components/Tables/Types";
import {
  fetchRefundRequests,
  approveRefund,
  rejectRefund,
} from "@/Services/booking-service";

/*
 * ฟังก์ชัน : normalizeText
 * คำอธิบาย : แปลงข้อความให้เป็นตัวพิมพ์เล็ก ลบช่องว่างเกิน และ normalize สำหรับค้นหา
 * Input : s (string)
 * Output : string ที่ถูก normalize แล้ว
 */
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

/*
 * คำอธิบาย : โครงสร้างข้อมูลคำขอคืนเงินที่ใช้แสดงในตาราง
 */
type RefundRow = {
  id: number;
  touristName: string;
  packageName: string;
  totalPrice: string;
  status: string;
  transferSlip: string;
};

export function ManageRefundBooking() {
  // State หลัก
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal ยืนยันอนุมัติ
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => {});

  // Modal ปฏิเสธ (มีเหตุผล)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  /*
   * ฟังก์ชัน : fetchData
   * คำอธิบาย : ดึงข้อมูลคำขอคืนเงินทั้งหมดของชุมชนจาก API
   * Input : pagination.currentPage, pagination.limit
   * Output : เซตข้อมูลตารางและข้อมูลหน้าปัจจุบัน
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetchRefundRequests(pagination.currentPage, pagination.limit);
      const payload = res.data?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const pg = payload?.pagination ?? {};

      const mapped: RefundRow[] = list.map((r: any) => ({
        id: r.id,
        touristName: `${r.tourist?.fname ?? ""} ${r.tourist?.lname ?? ""}`.trim(),
        packageName: r.package?.name ?? "-",
        totalPrice: `฿${((r.package?.price ?? 0) * (r.totalParticipant ?? 1)).toLocaleString()}`,
        status:
          r.status === "REFUND_PENDING"
            ? "รอคืนเงิน"
            : r.status === "REFUNDED"
            ? "อนุมัติแล้ว"
            : r.status === "REFUND_REJECTED"
            ? "ปฏิเสธแล้ว"
            : "-",
        transferSlip: r.transferSlip
          ? `${import.meta.env.VITE_API_URL}/${r.transferSlip}`
          : "-",
      }));

      setRows(mapped);
      setPagination((prev) => ({
        ...prev,
        totalPages: pg.totalPages ?? 1,
        totalCount: pg.totalCount ?? mapped.length,
      }));
    } catch (error: any) {
      console.error("Fetch refund requests failed:", error);
      setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*
   * ฟังก์ชัน : filteredRows
   * คำอธิบาย : กรองข้อมูลในตารางตามคำค้น
   */
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter(
      (r) =>
        !q ||
        r.touristName.toLowerCase().includes(q) ||
        r.packageName.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // คอลัมน์ของ DataTable
  const columns: Column<RefundRow>[] = [
    { key: "touristName", header: "ชื่อผู้จอง" },
    { key: "packageName", header: "ชื่อกิจกรรม" },
    { key: "totalPrice", header: "ราคารวม" },
    { key: "status", header: "สถานะ" },
    {
      key: "transferSlip",
      header: "หลักฐาน",
      render: (row) =>
        row.transferSlip !== "-" ? (
          <a
            href={row.transferSlip}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4A816F] underline hover:text-[#376454]"
          >
            ดูหลักฐาน
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      header: <div className="text-center pr-4">จัดการ</div>,
      className: "!text-right",
      width: "160px",
      render: (row) =>
        row.status === "รอคืนเงิน" ? (
          <div className="flex gap-2 justify-end pr-4">
            {/* ปุ่มปฏิเสธ */}
            <button
              onClick={() => {
                setSelectedRejectId(row.id);
                setRejectModalOpen(true);
              }}
              className="border border-[#4A816F] text-[#4A816F] bg-white hover:bg-[#E6F0EC]
                         text-[13px] h-[31px] min-w-[77px] rounded-md px-3 py-[2px]
                         transition-colors duration-200"
            >
              ปฏิเสธ
            </button>

            {/* ปุ่มอนุมัติ */}
            <button
              onClick={() => {
                setModalTitle("ยืนยันการอนุมัติ");
                setModalText(
                  `คุณต้องการอนุมัติคำขอคืนเงินของ "${row.touristName}" หรือไม่?`
                );
                setOnConfirmAction(() => async () => {
                  try {
                    await approveRefund(row.id);
                    await fetchData();
                  } catch (err) {
                    console.error("Approve failed:", err);
                    alert("เกิดข้อผิดพลาดในการอนุมัติคำขอ");
                  }
                });
                setModalOpen(true);
              }}
              className="bg-[#4A816F] text-white hover:bg-[#3B6D5D]
                         text-[13px] h-[31px] min-w-[77px] rounded-md px-3 py-[2px]
                         transition-colors duration-200"
            >
              อนุมัติ
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-center pr-4">-</div>
        ),
    },
  ];

  // Bulk Actions (อนุมัติทั้งหมด)
  const bulkActions: BulkAction<RefundRow>[] = [
    {
      id: "bulk-approve",
      label: "อนุมัติทั้งหมด",
      onClick: (rows) => {
        setModalTitle("ยืนยันอนุมัติทั้งหมด");
        setModalText(`คุณต้องการอนุมัติคำขอคืนเงิน ${rows.length} รายการหรือไม่?`);
        setOnConfirmAction(() => async () => {
          for (const r of rows) {
            try {
              await approveRefund(r.id);
            } catch (err) {
              console.error(`Approve failed for ID ${r.id}:`, err);
            }
          }
          await fetchData();
        });
        setModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-4 cursor-default">
      {/* Breadcrumb */}
      <div className="-ml-6 pt-1 pb-1">
        <Breadcrumb
          items={[
            { label: "จัดการการจอง", to: "/admin/booking" },
            { label: "คำขอคืนเงิน" },
          ]}
        />
      </div>

      {/* Header + Toolbar */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">คำขอคืนเงิน</h1>
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Table */}
      <DataTable<RefundRow>
        data={filteredRows}
        columns={columns}
        getKey={(row) => String(row.id)}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(p) =>
          setPagination((prev) => ({ ...prev, currentPage: p }))
        }
        onPageSizeChange={(s) =>
          setPagination((prev) => ({ ...prev, limit: s, currentPage: 1 }))
        }
        isLoading={isLoading}
        theme="brand"
      />

      {/* Modal ยืนยันอนุมัติ */}
      <Modal
        open={modalOpen}
        title={modalTitle}
        text={modalText}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          onConfirmAction();
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      />

      {/* Modal ปฏิเสธ (พร้อมกรอกเหตุผล) */}
      <RejectModal
        open={rejectModalOpen}
        title="ปฏิเสธคำขอคืนเงิน"
        text="กรุณาระบุเหตุผลการปฏิเสธ เพื่อส่งให้นักท่องเที่ยวทราบ"
        confirmText={isRejecting ? "กำลังส่ง..." : "ส่ง"}
        cancelText="ยกเลิก"
        maxLength={100}
        onConfirm={async (reason) => {
          if (!selectedRejectId) return;
          setIsRejecting(true);
          try {
            await rejectRefund(selectedRejectId, reason);
            await fetchData();
          } catch (err) {
            console.error("Reject failed:", err);
            alert("เกิดข้อผิดพลาดในการปฏิเสธคำขอ");
          } finally {
            setIsRejecting(false);
            setRejectModalOpen(false);
            setSelectedRejectId(null);
          }
        }}
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedRejectId(null);
        }}
      />
    </div>
  );
}
