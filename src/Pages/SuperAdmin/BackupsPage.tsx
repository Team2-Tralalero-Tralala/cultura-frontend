/*
 * คำอธิบาย : Component สำหรับจัดการไฟล์สำรองข้อมูล (Super Admin)
 * โดยแบ่งออกเป็นส่วนหลัก ได้แก่
 * 1. แสดงตารางไฟล์สำรองข้อมูล: ชื่อไฟล์ / ขนาด / สถานะ / วันที่สร้าง
 * 2. ค้นหาไฟล์สำรองข้อมูล
 * 3. ดาวน์โหลดไฟล์สำรองข้อมูล
 * 4. ลบไฟล์สำรองข้อมูล (เดี่ยว/หลายไฟล์)
 * 5. แสดงสถานะเซิร์ฟเวอร์ (ออนไลน์/ออฟไลน์)
 * ใช้ร่วมกับ Component ย่อย เช่น DataTable, SearchBarTable, Modal
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BulkAction, Column, Pagination, RowAction } from "../../Components/Tables/Types";

import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import {
  deleteBackup,
  deleteBulkBackups,
  downloadBackup,
  fetchBackups,
} from "@/Libs/BackupService";
import { fetchServerStatus } from "@/Libs/ServerStatusService";
import type { BackupRow } from "@/Types/Backup";
import { Icon } from "@iconify/react";

/*
 * คำอธิบาย : แปลงสถานะไฟล์สำรองข้อมูลจากภาษาอังกฤษเป็นภาษาไทย
 * Input :
 *    - status (string): สถานะที่ต้องการแปลง (completed, processing, failed)
 * Output :
 *    - คืนค่าข้อความสถานะเป็นภาษาไทย (เสร็จสิ้น, กำลังดำเนินการ, ล้มเหลว)
 */
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

/*
 * คำอธิบาย : แปลงวันที่และเวลาการสร้างไฟล์สำรองข้อมูลเป็นรูปแบบภาษาไทย
 * Input :
 *    - createdAt (string): วันที่และเวลาในรูปแบบ ISO string
 * Output :
 *    - คืนค่าวันที่และเวลาในรูปแบบภาษาไทย (เช่น "28 ต.ค. 2567, 14:30 น.")
 */
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
/*
 * คำอธิบาย : สร้างคอลัมน์สำหรับตารางแสดงไฟล์สำรองข้อมูล
 * Input :
 *    - onDownload (function): ฟังก์ชันสำหรับดาวน์โหลดไฟล์สำรองข้อมูล
 * Output :
 *    - คืนค่า array ของคอลัมน์ตารางประกอบด้วย ชื่อไฟล์, ขนาด, สถานะ, วันที่สร้าง
 */
const createColumns = (onDownload: (filename: string) => void): Column<BackupRow>[] => [
  {
    key: "filename",
    header: "ชื่อ",
    className: "min-w-[300px]",
    render: (row) => (
      <div className="flex items-center gap-2">
        {/* <div className="text-xs bg-gray-100 px-2 py-1 rounded">ZIP</div> */}
        <button
          onClick={() => onDownload(row.filename)}
          className="text-left hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-2"
          title="คลิกเพื่อดาวน์โหลดไฟล์สำรองข้อมูล"
        >
          <div>{row.filename}</div>
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
    render: (row) => <div>{row.size}</div>,
  },
  {
    key: "status",
    header: "สถานะ",
    className: "min-w-[120px]",
    render: (row) => <div>{thaiStatusName(row.status)}</div>,
  },
  {
    key: "createdAt",
    header: "วัน-เวลาที่สำรองข้อมูลล่าสุด",
    className: "min-w-[200px]",
    render: (row) => thaiBackupTime(row.createdAt),
  },
];

/*
 * คำอธิบาย : สร้างรายการปุ่มดำเนินการต่อแถวในตาราง
 * Input :
 *    - onDelete (function): ฟังก์ชันสำหรับลบไฟล์สำรองข้อมูล
 * Output :
 *    - คืนค่า array ของปุ่มดำเนินการ (ลบ)
 */
const rowActions = (onDelete: (filename: string) => void): RowAction<BackupRow>[] => [
  {
    id: "delete",
    label: "ลบ",
    icon: TrashIcon,
    onClick: (row) => onDelete(row.filename),
    intent: "danger",
  },
];

/*
 * คำอธิบาย : สร้างรายการปุ่มดำเนินการแบบหลายแถวในตาราง
 * Input :
 *    - onBulkDelete (function): ฟังก์ชันสำหรับลบไฟล์สำรองข้อมูลหลายไฟล์
 * Output :
 *    - คืนค่า array ของปุ่มดำเนินการแบบ bulk (ลบที่เลือก)
 */
const bulkActions = (onBulkDelete: (filenames: string[]) => void): BulkAction<BackupRow>[] => [
  {
    id: "delete-bulk",
    label: "ลบที่เลือก",
    icon: TrashIcon,
    onClick: (rows) => onBulkDelete(rows.map((row) => row.filename)),
    intent: "danger",
  },
];

/**
 * คำอธิบาย: หน้าหลักสำหรับจัดการไฟล์สำรองข้อมูล
 * Input: -
 * Output: React Component สำหรับแสดงผลหน้า Backups
 */
export default function BackupsPage() {
  const navigate = useNavigate();
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

  /*
   * คำอธิบาย : ดึงข้อมูลไฟล์สำรองข้อมูลจาก API และตรวจสอบสถานะเซิร์ฟเวอร์
   * Input : ไม่มี
   * Output :
   *    - อัพเดท state ของ rows, pagination, serverStatus
   *    - หากเกิดข้อผิดพลาดจะเซ็ต errorMessage
   */
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

  /*
   * คำอธิบาย : เปิด modal ยืนยันการลบไฟล์สำรองข้อมูลไฟล์เดียว
   * Input :
   *    - filename (string): ชื่อไฟล์ที่ต้องการลบ
   * Output :
   *    - เซ็ต deleteModal state เพื่อเปิด modal ยืนยันการลบ
   */
  const handleDeleteSingle = (filename: string) => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      filename,
    });
  };

  /*
   * คำอธิบาย : เปิด modal ยืนยันการลบไฟล์สำรองข้อมูลหลายไฟล์
   * Input :
   *    - filenames (string[]): array ของชื่อไฟล์ที่ต้องการลบ
   * Output :
   *    - เซ็ต deleteModal state เพื่อเปิด modal ยืนยันการลบแบบ bulk
   */
  const handleDeleteBulk = (filenames: string[]) => {
    setDeleteModal({
      isOpen: true,
      type: "bulk",
      filenames,
    });
  };

  /*
   * คำอธิบาย : ดำเนินการลบไฟล์สำรองข้อมูลหลังจากยืนยันใน modal
   * Input : ไม่มี
   * Output :
   *    - ลบไฟล์สำรองข้อมูลตามประเภท (single หรือ bulk)
   *    - โหลดข้อมูลใหม่หลังจากลบสำเร็จ
   *    - ปิด modal และรีเซ็ต deleteModal state
   *    - หากเกิดข้อผิดพลาดจะเซ็ต errorMessage
   */
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

  /*
   * คำอธิบาย : ยกเลิกการลบไฟล์สำรองข้อมูลและปิด modal
   * Input : ไม่มี
   * Output :
   *    - ปิด modal และรีเซ็ต deleteModal state
   */
  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, type: "single" });
  };

  /*
   * คำอธิบาย : ดาวน์โหลดไฟล์สำรองข้อมูลจากเซิร์ฟเวอร์
   * Input :
   *    - filename (string): ชื่อไฟล์ที่ต้องการดาวน์โหลด
   * Output :
   *    - ดาวน์โหลดไฟล์สำรองข้อมูลผ่านเบราว์เซอร์
   *    - หากเกิดข้อผิดพลาดจะเซ็ต errorMessage
   */
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
        <Breadcrumb
          current={{
            label: "สำรองข้อมูล",
            to: "/super/backups",
          }}
        />
        <div className="flex items-center justify-between align-top">
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Icon
                icon="lucide:arrow-left"
                className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => navigate("/super/setting")}
              />
              สำรองข้อมูล
            </h1>
            <div className="flex items-center justify-between gap-3 w-full"></div>
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
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
        }}
        onPageSizeChange={(pageSize) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: pageSize,
          }));
        }}
        pagination={pagination}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
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
