/**
 * Component: ManagePackageRequestPage
 * คำอธิบาย:
 *  - ใช้สำหรับ Admin เพื่อตรวจสอบและจัดการคำขออนุมัติแพ็กเกจจากชุมชน
 *  - รองรับการค้นหา, pagination, และแสดงข้อมูลผู้ดูแล/ชุมชน
 *  - สามารถ "อนุมัติ" และ "ปฏิเสธ" แพ็กเกจได้ผ่าน Modal
 *  - เมื่ออนุมัติ/ปฏิเสธ จะมีการ reload ข้อมูลในตารางทันที
 */
import React, { useEffect } from "react";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import ModalReject from "@/Components/Modal/ModalReject";
import { Link } from "react-router-dom";
import {
  approvePackageRequestForAdmin,
  fetchPackageRequests,
  rejectPackageRequestForAdmin,
} from "@/Libs/PackageService";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

type PackageRequestRow = {
  id: number;
  name: string;
  statusApprove: "PENDING_SUPER" | string | null;
  community: { id: number; name: string };
  overseer: { id: number; username: string };
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};

/**
 * คำอธิบาย: แปลงสถานะคำขออนุมัติเป็นข้อความภาษาไทย
 * Input: status (string | null)
 * Output: ข้อความสถานะภาษาไทย หรือ "-"
 */
const getThaiApprovalStatus = (status?: string | null) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING_SUPER":
      return "รออนุมัติ";
    default:
      return "-";
  }
};

/**
 * คำอธิบาย:
 *  - สร้างชุด Columns สำหรับตารางคำขอแพ็กเกจ
 *  - รองรับปุ่มอนุมัติ / ปฏิเสธ
 *  - รับ callback จาก parent เพื่อส่ง event การคลิกในแต่ละแถว
 * Input:
 * - onApprove: callback เมื่อกดปุ่มอนุมัติ
 * - onReject: callback เมื่อกดปุ่มปฏิเสธ
 * Output: Column definition
 */
const createPackageRequestColumns = (
  onApprove: (row: PackageRequestRow) => void,
  onReject: (row: PackageRequestRow) => void,
): Column<PackageRequestRow>[] => [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      className: "min-w-[220px]",
      render: (r) => (
        <Link
          to={`/admin/package-requests/${r.id}`}
          className="font-medium text-dark-green hover:underline focus:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "community",
      header: "ชื่อชุมชน",
      className: "min-w-[220px]",
      render: (r) => <div>{r.community.name}</div>,
    },
    {
      key: "overseer",
      header: "ผู้ดูแล",
      className: "min-w-[160px]",
      render: (r) => <div>{r.overseer.username}</div>,
    },
    {
      key: "statusApprove",
      header: "สถานะคำขอ",
      render: (r) => <div>{getThaiApprovalStatus(r.statusApprove)}</div>,
    },
    {
      key: "actions",
      header: "จัดการ",
      className: "w-[160px] text-left pr-3",
      render: (r) => {
        const approved = String(r.statusApprove).toUpperCase() === "APPROVE";
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            {!approved && (
              <div className="w-[76px] ml-1 [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
                <Button type="cancel" onClick={() => onReject(r)}>
                  ปฏิเสธ
                </Button>
              </div>
            )}
            {!approved && (
              <div className="w-[76px] ml-1 [&>button]:w-full [&>button]:px-2 [&>button]:py-1 [&>button]:text-sm">
                <Button type="confirm-admin" onClick={() => onApprove(r)}>
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

/**
 * คำอธิบาย: Page Component สำหรับรายการคำขออนุมัติแพ็กเกจ (Admin)
 */
export default function ManagePackageRequestPage() {
  const [rows, setRows] = React.useState<PackageRequestRow[]>([]);
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
   * คำอธิบาย:
   *  - โหลดข้อมูลคำขอแพ็กเกจจาก API
   *  - อัปเดตตาราง + pagination
   *  - ใช้ร่วมกับ useEffect เพื่อโหลดข้อมูลตาม page / pageSize / searchQuery
   */
  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { data } = await fetchPackageRequests(currentPage, pageSize, searchQuery, "PENDING");
      setRows(data?.data?.data ?? []);
      setPagination(
        data?.data?.pagination ?? {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: pageSize,
        },
      );
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  /**
   * useEffect: เรียก reload() ทุกครั้งที่ currentPage, pageSize หรือ searchQuery เปลี่ยน
   */
  React.useEffect(() => {
    reload();
  }, [reload, currentPage, pageSize, searchQuery]);

  /**
   * useEffect: เมื่อ searchQuery เปลี่ยน ให้กลับไปหน้าแรกของตาราง
   */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /**
   * คำอธิบาย:
   *  - ส่งคำขออนุมัติไปยัง backend
   *  - เมื่อสำเร็จ จะ reload ข้อมูลตารางใหม่
   *  - ถ้าเกิด error จะเก็บข้อความ error ลง state
   * Input: row (PackageRequestRow)
   * Output: void
   */
  const handleApprove = async (row: PackageRequestRow) => {
    try {
      setIsLoading(true);
      await approvePackageRequestForAdmin(row.id);
      await reload();
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ไม่สามารถอนุมัติได้");
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย:
   *  - เปิด Modal ปฏิเสธคำขอ (RejectModal)
   *  - เซ็ต row ที่ถูกเลือกลงใน selectedRow
   * Input: row (PackageRequestRow)
   * Output: void
   */
  const openRejectModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setIsRejectModalOpen(true);
  };

  /**
   * คำอธิบาย:
   *  - เปิด Modal ยืนยันการอนุมัติแพ็กเกจ
   *  - เซ็ต row ที่ผู้ใช้เลือกลง selectedRow
   * Input: row (PackageRequestRow)
   * Output: void
   */
  const openApproveModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setIsConfirmModalOpen(true);
  };

  /**
   * useEffect: เมื่อ Modal อนุมัติถูกปิด (isConfirmModalOpen = false)
   * รีเซ็ต selectedRow ให้กลับเป็น null (ใช้ setTimeout เพื่อหลีกเลี่ยง state update ระหว่าง render)
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
            to: `/admin/package-requests`,
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
        data={rows}
        columns={createPackageRequestColumns(openApproveModal, openRejectModal)}
        getKey={(r: PackageRequestRow) => String(r.id)}
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
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* Modal: ยืนยันการอนุมัติแพ็กเกจ */}
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
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

      {/* Modal: ปฏิเสธคำขอ */}
      {isRejectModalOpen && (
        <ModalReject
          isOpen={isRejectModalOpen}
          title="ปฏิเสธคำขออนุมัติ"
          text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ"
          confirmText="ส่ง"
          cancelText="ยกเลิก"
          onConfirm={async (reason) => {
            if (!selectedRow) return;
            try {
              setIsLoading(true);
              await rejectPackageRequestForAdmin(selectedRow.id, reason);
              await reload();
            } catch (e: any) {
              setErrorMessage(e?.message ?? "ไม่สามารถปฏิเสธได้");
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
