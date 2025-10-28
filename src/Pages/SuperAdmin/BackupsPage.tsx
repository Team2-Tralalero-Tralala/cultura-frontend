// src/Pages/SuperAdmin/BackupsPage.tsx
/**
 * จัดการสำรองข้อมูล (Super Admin)
 * - แสดงตารางไฟล์สำรองข้อมูล: ชื่อไฟล์ / ขนาด / สถานะ / วันที่สร้าง
 * - ค้นหา, ลบไฟล์สำรองข้อมูล (เดี่ยว/หลายไฟล์)
 * - ปุ่มลบ ต่อแถว และลบหลายแถว
 */
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import React, { useState } from "react";
import type { BulkAction, Column, Pagination, RowAction } from "../../Components/Tables/Types";

import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import {
  deleteBackup,
  deleteBulkBackups,
  downloadBackup,
  fetchBackups,
} from "@/Services/backup-service";
import type { BackupRow } from "@/Types/Backup";
import { Icon } from "@iconify/react";
import { fetchServerStatus } from "@/Services/server-status-service";

const thaiStatusName = (status: string) => {
  switch (status) {
    case "completed":
      return "เสร็จสิ้น";
    case "processing":
      return "กำลังดำเนินการ";
    case "failed":
      return "ล้มเหลว";
    default:
      return status;
  }
};

const thaiBackupTime = (createdAt: string) => {
  return (
    new Date(createdAt).toLocaleString("th-TH", {
      year: "numeric",
      month: "short", // ใช้เดือนย่อ (เช่น ม.ค., ก.พ., ส.ค.)
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // ใช้เวลาแบบ 24 ชั่วโมง
    }) + " น."
  );
};

// ====== คอลัมน์ตาราง ======
const createColumns = (onDownload: (filename: string) => void): Column<BackupRow>[] => [
  {
    key: "filename",
    header: "ชื่อ",
    className: "min-w-[300px]",
    render: (r) => (
      <div className="flex items-center gap-2">
        {/* <div className="text-xs bg-gray-100 px-2 py-1 rounded">ZIP</div> */}
        <button
          onClick={() => onDownload(r.filename)}
          className="text-left hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-2"
          title="คลิกเพื่อดาวน์โหลดไฟล์สำรองข้อมูล"
        >
          <div>{r.filename}</div>
          <div className="w-6 h-6">
            <Icon icon="formkit:zip" className="w-full h-full" />
          </div>
        </button>
      </div>
    ),
  },
  {
    key: "size",
    header: "ขนาด",
    className: "min-w-[120px]",
    render: (r) => <div>{r.size}</div>,
  },
  {
    key: "status",
    header: "สถานะ",
    className: "min-w-[120px]",
    render: (r) => <div>{thaiStatusName(r.status)}</div>,
  },
  {
    key: "createdAt",
    header: "วัน-เวลาที่สำรองข้อมูลล่าสุด",
    className: "min-w-[200px]",
    render: (r) => thaiBackupTime(r.createdAt),
  },
];

// ====== Row Actions ======
const rowActions = (onDelete: (filename: string) => void): RowAction<BackupRow>[] => [
  {
    id: "delete",
    label: "ลบ",
    icon: TrashIcon,
    onClick: (row) => onDelete(row.filename),
    intent: "danger",
  },
];

// ====== Bulk Actions ======
const bulkActions = (onBulkDelete: (filenames: string[]) => void): BulkAction<BackupRow>[] => [
  {
    id: "delete-bulk",
    label: "ลบที่เลือก",
    icon: TrashIcon,
    onClick: (rows) => onBulkDelete(rows.map((row) => row.filename)),
    intent: "danger",
  },
];

export default function BackupsPage() {
  // ====== state ตาราง ======
  const [rows, setRows] = React.useState<BackupRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [serverStatus, setServerStatus] = React.useState<boolean>(true);

  const [searchQuery, setSearchQuery] = React.useState("");

  // ====== state สำหรับการลบ ======
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    filename?: string;
    filenames?: string[];
  }>({
    isOpen: false,
    type: "single",
  });

  // ====== โหลดข้อมูล ======
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const {
        data: { data: resultData, pagination: resultPagination },
      } = await fetchBackups(pagination.currentPage, pagination.limit, searchQuery);
      const serverStatusData = await fetchServerStatus();
      setServerStatus(serverStatusData.serverOnline);
      setRows(resultData);
      setPagination(resultPagination);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  // ====== ฟังก์ชันจัดการการลบ ======
  const handleDeleteSingle = (filename: string) => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      filename,
    });
  };

  const handleDeleteBulk = (filenames: string[]) => {
    setDeleteModal({
      isOpen: true,
      type: "bulk",
      filenames,
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteModal.type === "single" && deleteModal.filename) {
        await deleteBackup(deleteModal.filename);
      } else if (deleteModal.type === "bulk" && deleteModal.filenames) {
        await deleteBulkBackups(deleteModal.filenames);
      }

      // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
      await fetchData();
      setDeleteModal({ isOpen: false, type: "single" });
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ลบไฟล์สำรองข้อมูลไม่สำเร็จ");
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, type: "single" });
  };

  // ====== ฟังก์ชันดาวน์โหลด ======
  const handleDownload = async (filename: string) => {
    try {
      await downloadBackup(filename);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ดาวน์โหลดไฟล์สำรองข้อมูลไม่สำเร็จ");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sm">การตั้งค่า</h2>
        <div className="flex items-center justify-between align-top">
          <div>
          <h1 className="text-xl">สำรองข้อมูล</h1>
          <div className="flex items-center justify-between gap-3 w-full">
          </div>
            <div className="flex-1 max-w-md">
              <SearchBarTable
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              />
            </div>
          </div>
          <div>
            สถานะเซิร์ฟเวอร์
            <div className={`flex items-center gap-2 px-2 py-2 rounded-full bg-black text-white`}>
              {isLoading ? (
                <div className="w-6 h-6 rounded-full bg-gray-400 animate-pulse"></div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-full ${serverStatus ? "bg-green-500" : "bg-red-500"}`}
                ></div>
              )}
              <span className="font-medium pr-4">
                {isLoading ? "กำลังตรวจสอบ..." : serverStatus ? "ออนไลน์" : "ออฟไลน์"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<BackupRow>
        data={rows}
        getKey={(row) => row.filename}
        columns={createColumns(handleDownload)}
        bulkActions={bulkActions(handleDeleteBulk)}
        actions={{
          items: rowActions(handleDeleteSingle),
          variant: "icons",
        }}
        selectable={true}
        pageSizeOptions={[10, 30, 50]}
        onPageChange={(p) => {
          setPagination((prev) => ({ ...prev, currentPage: p }));
        }}
        onPageSizeChange={(p) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: p,
          }));
        }}
        pagination={pagination}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={
          deleteModal.type === "single"
            ? "ยืนยันการลบการสำรองข้อมูล"
            : "ยืนยันการลบการสำรองข้อมูลหลายไฟล์"
        }
        text={
          deleteModal.type === "single"
            ? `คุณต้องการยืนยันการลบการสำรองข้อมูล "${deleteModal.filename}" หรือไม่`
            : `คุณต้องการยืนยันการลบการสำรองข้อมูล ${deleteModal.filenames?.length} ไฟล์หรือไม่`
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
    </div>
  );
}
