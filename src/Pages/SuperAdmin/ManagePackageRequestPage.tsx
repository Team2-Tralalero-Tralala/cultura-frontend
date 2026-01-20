/**
 * คำอธิบาย : หน้าจัดการคำขออนุมัติแพ็กเกจสำหรับ Super Admin รองรับการค้นหา การแบ่งหน้า และการอนุมัติ/ปฏิเสธคำขอ
 */
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import {
  approvePackageRequest,
  fetchPackageRequests,
  rejectPackageRequest,
} from "@/Libs/PackageService";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

export type PackageRequestRow = {
  id: number;
  name: string;
  statusApprove: "PENDING_SUPER" | string | null;
  community: { id: number; name: string };
  overseer: { id: number; username: string };
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};

/**
 * คำอธิบาย : แปลงสถานะภาษาอังกฤษเป็นภาษาไทยสำหรับแสดงผล
 * Input : status (สถานะแพ็กเกจ)
 * Output : ข้อความสถานะภาษาไทย
 */
const thaiApproveStatus = (status?: string | null) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING_SUPER":
      return "รออนุมัติ";
    default:
      return "-";
  }
};

/**
 * คำอธิบาย : สร้างชุด Columns สำหรับตารางคำขอแพ็กเกจ รองรับปุ่มอนุมัติและปฏิเสธ
 * Input : onApprove (ฟังก์ชันอนุมัติ), onReject (ฟังก์ชันปฏิเสธ)
 * Output : Array ของ Column Configuration
 */
const buildPackageRequestColumns = (
  onApprove: (row: PackageRequestRow) => void,
  onReject: (row: PackageRequestRow) => void,
): Column<PackageRequestRow>[] => [
  {
    key: "name",
    header: "ชื่อแพ็กเกจ",
    className: "min-w-[220px]",
    render: (packageRequestRow) => (
      <Link
        to={`/super/package-requests/${packageRequestRow.id}`}
        className="font-medium text-dark-green hover:underline focus:underline"
      >
        {packageRequestRow.name}
      </Link>
    ),
  },
  {
    key: "community",
    header: "ชื่อชุมชน",
    className: "min-w-[220px]",
    render: (packageRequestRow) => <div>{packageRequestRow.community.name}</div>,
  },
  {
    key: "overseer",
    header: "ผู้ดูแล",
    className: "min-w-[160px]",
    render: (packageRequestRow) => <div>{packageRequestRow.overseer.username}</div>,
  },
  {
    key: "statusApprove",
    header: "สถานะคำขอ",
    render: (packageRequestRow) => <div>{thaiApproveStatus(packageRequestRow.statusApprove)}</div>,
  },
  {
    key: "actions",
    header: "จัดการ",
    className: "w-[160px] text-left pr-3",
    render: (packageRequestRow) => {
      const approved = String(packageRequestRow.statusApprove).toUpperCase() === "APPROVE";
      return (
        <div className="flex items-center justify-end gap-2 pr-2">
          {!approved && (
            <div className="w-[76px] ml-1 [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
              <Button type="cancel" onClick={() => onReject(packageRequestRow)}>
                ปฏิเสธ
              </Button>
            </div>
          )}
          {!approved && (
            <div className="w-[76px] ml-1 [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
              <Button type="confirm-admin" onClick={() => onApprove(packageRequestRow)}>
                อนุมัติ
              </Button>
            </div>
          )}
          {approved && (
            <div className="w-[76px] ml-1 opacity-70 pointer-events-none [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
              <Button type="confirm-admin">อนุมัติ</Button>
            </div>
          )}
        </div>
      );
    },
  },
];

/*
 * คำอธิบาย : Component สำหรับจัดการคำขออนุมัติแพ็กเกจ
 * Input : -
 * Output : JSX Element หน้า ManagePackageRequestPage
 */
export function ManagePackageRequestPage() {
  const [packageRequestRows, setPackageRequestRows] = React.useState<PackageRequestRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<PackageRequestRow | null>(null);

  /**
   * คำอธิบาย : โหลดข้อมูลคำขอแพ็กเกจจาก API และอัปเดตข้อมูลในตาราง
   * Input : -
   * Output : -
   */
  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { data } = await fetchPackageRequests(currentPage, pageSize, searchQuery);
      setPackageRequestRows(data?.data?.data ?? []);
      setPagination(
        data?.data?.pagination ?? {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: pageSize,
        },
      );
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  React.useEffect(() => {
    reload();
  }, [reload, currentPage, pageSize, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /**
   * คำอธิบาย : ส่งคำขออนุมัติแพ็กเกจไปยัง API และโหลดข้อมูลใหม่เมื่อสำเร็จ
   * Input : row (ข้อมูลแถวที่ต้องการอนุมัติ)
   * Output : -
   */
  const handleApprove = async (row: PackageRequestRow) => {
    try {
      setIsLoading(true);
      await approvePackageRequest(row.id);
      await reload();
    } catch (error: any) {
      setErrorMessage(error?.message ?? "ไม่สามารถอนุมัติได้");
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย : เปิด Modal ปฏิเสธคำขอและกำหนดแถวที่เลือก
   * Input : row (ข้อมูลแถวที่เลือก)
   * Output : -
   */
  const openRejectModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setIsRejectModalOpen(true);
  };

  /**
   * คำอธิบาย : เปิด Modal ยืนยันการอนุมัติและกำหนดแถวที่เลือก
   * Input : row (ข้อมูลแถวที่เลือก)
   * Output : -
   */
  const openApproveModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setIsConfirmModalOpen(true);
  };

  /**
   * คำอธิบาย : ตัวแปร Alias สำหรับฟังก์ชัน openRejectModal เพื่อใช้ส่งเป็น Callback
   */
  const handleReject = openRejectModal;

  /**
   * คำอธิบาย: รีเซ็ตค่า selectedRow เมื่อ Modal ปิดลง (ใช้ setTimeout เพื่อรอให้ Animation จบ)
   * Input : isConfirmModalOpen (สถานะ Modal ยืนยันการอนุมัติ)
   * Output : -
   */
  useEffect(() => {
    if (!isConfirmModalOpen) {
      setTimeout(() => {
        setSelectedRow(null);
      }, 0);
    }
  }, [isConfirmModalOpen]);

  return (
    <div className="space-y-4">
      {/* breadcrump */}
      <div>
        <Breadcrumb
          current={{
            label: "คำขออนุมัติ",
            to: `/super/package-requests`,
          }}
        />
      </div>
      {/* ส่วนหัว + ค้นหา */}
      <div className="flex flex-col gap-2 w-full">
        <h1 className="font-bold text-xl">คำขออนุมัติ</h1>

        <div className="flex items-center gap-2 w-full">
          <div className="w-[260px]">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <DataTable<PackageRequestRow>
        data={packageRequestRows}
        columns={buildPackageRequestColumns(openApproveModal, handleReject)}
        getKey={(packageRequestRow: PackageRequestRow) => String(packageRequestRow.id)}
        selectable={false}
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

      {/* Modal: ยืนยันการอนุมัติแพ็กเกจ
                - จะแสดงเมื่อผู้ใช้กดปุ่ม "อนุมัติ"
                - ใช้ selectedRow แสดงชื่อแพ็กเกจในข้อความยืนยัน
            */}

      {isConfirmModalOpen && (
        <Modal
          open={isConfirmModalOpen}
          title="ยืนยันการอนุมัติ"
          text={
            selectedRow
              ? `ต้องการอนุมัติแพ็กเกจ “${selectedRow.name}” ใช่หรือไม่`
              : "ต้องการอนุมัติแพ็กเกจนี้หรือไม่"
          }
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={async () => {
            if (!selectedRow) return;
            try {
              await handleApprove(selectedRow);
            } finally {
              setIsConfirmModalOpen(false);
            }
          }}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}

      {/* Modal: ปฏิเสธคำขอ
                - ให้ผู้ใช้กรอกเหตุผลการปฏิเสธ
                - เมื่อส่งสำเร็จ จะ reload ข้อมูลใหม่
            */}

      {isRejectModalOpen && (
        <RejectModal
          open={isRejectModalOpen}
          title="ปฏิเสธคำขออนุมัติ"
          text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ"
          confirmText="ส่ง"
          cancelText="ยกเลิก"
          onConfirm={async (reason) => {
            if (!selectedRow) return;
            try {
              setIsLoading(true);
              await rejectPackageRequest(selectedRow.id, reason);
              await reload();
            } catch (error: any) {
              setErrorMessage(error?.message ?? "ไม่สามารถปฏิเสธได้");
            } finally {
              setIsLoading(false);
              setIsRejectModalOpen(false);
              setSelectedRow(null);
            }
          }}
          onCancel={() => {
            setIsRejectModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}
    </div>
  );
}
