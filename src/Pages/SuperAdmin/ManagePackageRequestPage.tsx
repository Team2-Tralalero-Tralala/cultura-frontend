// src/Pages/SuperAdmin/PackageRequestsSuperAdmin.tsx
/**
 * หน้า "คำขออนุมัติแพ็กเกจ"
 * - ตาราง: ชื่อแพ็กเกจ / ชื่อชุมชน / ผู้ดูแล / สถานะ / จัดการ
 * - ค้นหา (ชิดซ้าย) + ปุ่ม ปฏิเสธ/อนุมัติ (PATCH แล้วรีโหลด)
 */

import React from "react";

import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import type { Column } from "@/Components/Tables/Types";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import { Link } from "react-router-dom";
import { approvePackageRequest, fetchPackageRequests, rejectPackageRequest } from "@/Services/package-request-service";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/** แถวข้อมูลของตาราง */
export type PackageRequestRow = {
  id: number;
  name: string;
  statusApprove: "PENDING_SUPER" | string | null;
  community: { id: number; name: string };
  overseer: { id: number; username: string };
};

/** โครงสร้าง pagination จาก BE */
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};

/* ---------------------------- Utils ---------------------------- */

const thaiApproveStatus = (status?: string | null) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING_SUPER":
      return "รออนุมัติ";
    default:
      return "-";
  }
};

/* --------------------------- Columns --------------------------- */

const makeColumns = (
  onApprove: (row: PackageRequestRow) => void,
  onReject: (row: PackageRequestRow) => void
): Column<PackageRequestRow>[] => [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      className: "min-w-[220px]",
      render: (r) => (
        <Link
          to={`/super/package-requests/${r.id}`}
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
      render: (r) => <div>{thaiApproveStatus(r.statusApprove)}</div>,
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

/* -------------------------- Component -------------------------- */

export default function PackageRequestsSuperAdmin() {
  // ตาราง & pagination
  const [rows, setRows] = React.useState<PackageRequestRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  // const [pageSize, setPageSize] = React.useState<number>(10);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // ค้นหา + errors
  const [searchQuery, setSearchQuery] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Modal states
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] =
    React.useState<PackageRequestRow | null>(null);

  /** โหลดข้อมูล */
  const reload = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data } = await fetchPackageRequests(
        currentPage,
        pageSize,
        searchQuery
      );

      setRows(data?.data?.data ?? []);
      setPagination(
        data?.data?.pagination ?? {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: pageSize,
        }
      );
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  React.useEffect(() => {
    reload();
  }, [reload, currentPage, pageSize, searchQuery]);

  // เปลี่ยนคำค้น → กลับหน้าแรก
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /** อนุมัติ */
  const handleApprove = async (row: PackageRequestRow) => {
    try {
      setIsLoading(true);
      await approvePackageRequest(row.id);
      await reload();
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ไม่สามารถอนุมัติได้");
      setIsLoading(false);
    }
  };

  /** เปิด/ปิดโมดัล */
  const openRejectModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setRejectOpen(true);
  };
  const openApproveModal = (row: PackageRequestRow) => {
    setSelectedRow(row);
    setConfirmOpen(true);
  };

  /** alias เพื่อส่งให้คอลัมน์ */
  const handleReject = openRejectModal;

  return (
    <div className="space-y-4">
      {/* ส่วนหัว + ค้นหา */}
      <div className="flex flex-col gap-2 w-full">
        <div>
          <Breadcrumb
            current={{
              label: "คำขออนุมัติแพ็กเกจ",
              to: "/super/package-requests",
            }}
          />
        </div>
        <h1 className="text-xl">คำขออนุมัติแพ็กเกจ</h1>

        <div className="flex items-center gap-2 w-full">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ข้อความผิดพลาด */}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* ตาราง */}
      <DataTable<PackageRequestRow>
        data={rows}
        columns={makeColumns(openApproveModal, handleReject)}
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
          setCurrentPage(1); // รีเซ็ตไปหน้าแรกเมื่อเปลี่ยนจำนวนแถว
        }}
      />

      {/* Modal: ยืนยันอนุมัติ */}
      <Modal
        open={confirmOpen}
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
