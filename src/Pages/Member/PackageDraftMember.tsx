/**
   * คำอธิบาย : หน้าจอแสดงรายการแพ็กเกจฉบับร่างของสมาชิก
   *หน้าที่ :
   * - ดึงข้อมูลแพ็กเกจฉบับร่างจาก API
   * - แสดงในตารางพร้อมระบบค้นหา, ลบเดี่ยว, ลบหลายรายการ
   */
//Modules
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
// Components
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";
// Types
import type { BulkAction } from "../../Components/Tables/Types";
import { TrashIcon, PencilIcon } from "../../Components/Tables/Icon";

/**
   * คำอธิบาย : Interface สำหรับรายการแพ็กเกจ
   */
interface PackageItem {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
}
// API Base URL
const API_BASE = "http://localhost:3000/api";
/**
   * คำอธิบาย : ฟังก์ชันจัดรูปแบบข้อความให้เป็นมาตรฐานก่อนนำไปค้นหา
   * Input : value (unknown)
   * Output : string ที่ถูก trim, lowercase และ normalize
   */
function normalizeText(value: unknown): string {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ");
}
/**
   * คำอธิบาย : Component แสดงรายการแพ็กเกจฉบับร่างของสมาชิก
   * หน้าที่ :
   * - ดึงข้อมูลแพ็กเกจฉบับร่างจาก API
   * - แสดงในตารางพร้อมระบบค้นหา, ลบเดี่ยว, ลบหลายรายการ
   */
const PackageDraftMember: React.FC = () => {
  // State
  const [items, setItems] = useState<PackageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });
  // เลือกรายการแพ็กเกจ
  const [selectedRows, setSelectedRows] = useState<PackageItem[]>([]);
  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; pkg: PackageItem | null }>(
    { open: false, pkg: null }
  );
  // Modal ลบหลายรายการ
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{ open: boolean; rows: PackageItem[] }>(
    { open: false, rows: [] }
  );
/**
   * คำอธิบาย : ดึงข้อมูลแพ็กเกจฉบับร่างจาก API
   * Output : ตั้งค่า items และ pagination
   */
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    // ดึงข้อมูลจาก API
    try {
      const res = await axios.get(`${API_BASE}/member/packages/draft`, { withCredentials: true });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      const formatted: PackageItem[] = data.map((pkg: any) => ({
        id: pkg.id ?? 0,
        name: pkg.name ?? "-",
        community: pkg.community?.name ?? "-",
        overseer: pkg.overseerPackage?.username ?? "-",
        status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage ?? "-",
      }));
    // อัปเดตรายการแพ็กเกจ
      setItems(formatted);
    // อัปเดตข้อมูลการแบ่งหน้า
      setPagination((prev) => ({
        ...prev,
        totalCount: formatted.length,
        totalPages: Math.max(1, Math.ceil(formatted.length / prev.limit)),
      }));
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPackages();
  }, [fetchPackages]);
/**
   * คำอธิบาย : กรองข้อมูลแพ็กเกจตามคำค้นหา
   * Input : items, searchTerm
   * Output : ข้อมูลแพ็กเกจที่กรองแล้ว (filteredRows)
   */
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return items;

    return items.filter((pkg) => {
      const values = [pkg.name, pkg.community, pkg.overseer, pkg.status].map(normalizeText);
      return values.some((v) => v.includes(q));
    });
  }, [items, searchTerm]);
    // อัปเดต pagination เมื่อ filteredRows เปลี่ยนแปลง
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: filteredRows.length,
      totalPages: Math.max(1, Math.ceil(filteredRows.length / prev.limit)),
    }));
  }, [filteredRows]);
/**
   * คำอธิบาย : แบ่งหน้าข้อมูลหลังจากกรองผลลัพธ์
   * Input : filteredRows, pagination.currentPage, pagination.limit
   * Output : ข้อมูลแพ็กเกจที่แสดงในตาราง (paginatedRows)
   */
  const paginatedRows = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredRows.slice(start, start + pagination.limit);
  }, [filteredRows, pagination.currentPage, pagination.limit]);
/**
   * คำอธิบาย : ลบแพ็กเกจรายการเดียว
   * Input : deleteModal.pkg
   * Output : ลบข้อมูลและโหลดใหม่
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModal.pkg) return;
    
    const idToDelete = deleteModal.pkg.id;//
    setDeleteModal({ open: false, pkg: null });

    try {
      await axios.delete(`${API_BASE}/member/packages/draft/${idToDelete}`, { withCredentials: true });
      void fetchPackages();
    } catch (err) {
    }
  }, [deleteModal, fetchPackages]);
/**
  * คำอธิบาย : ลบแพ็กเกจหลายรายการ
  * Input : bulkDeleteModal.rows
  * Output : ลบข้อมูลและโหลดใหม่
  */
  const handleConfirmBulkDelete = useCallback(async () => {
    const ids = bulkDeleteModal.rows.map((r) => r.id);
    setBulkDeleteModal({ open: false, rows: [] });

    if (ids.length === 0) return;

    try {
      await axios.patch(`${API_BASE}/member/packages/draft/bulk-delete`, { ids }, { withCredentials: true });
      setSelectedRows([]);
      void fetchPackages();
    } catch (err) {
    }
  }, [bulkDeleteModal, fetchPackages]);
 /**
   * คำอธิบาย : กำหนดการกระทำแบบกลุ่ม (Bulk Actions) สำหรับตารางแสดงแพ็กเกจฉบับร่าง
   */
  const bulkActions: BulkAction<PackageItem>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: (rows) => setBulkDeleteModal({ open: true, rows }),
    },
  ];
/**
   * คำอธิบาย : กำหนดคอลัมน์สำหรับตารางแสดงแพ็กเกจฉบับร่าง
   */
  const columns: Column<PackageItem>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (pkg) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() => (window.location.href = `/member/package/${pkg.id}`)}
        >
          {pkg.name}
        </span>
      ),
    },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ชื่อผู้ดูแล" },
    { key: "status", header: "สถานะ" },
    {
      key: "setting",
      header: "จัดการ",
      render: (pkg) => (
        <div className="flex space-x-2">
          <span
            className="cursor-pointer"
            onClick={() => (window.location.href = `/member/package/${pkg.id}/edit`)}
            aria-label={`edit-${pkg.id}`}
          >
            <PencilIcon className="w-4 h-4" />
          </span>

          <span
            className="cursor-pointer"
            onClick={() => setDeleteModal({ open: true, pkg })}
            aria-label={`delete-${pkg.id}`}
          >
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      ),
    },
  ];


  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      <Breadcrumb current={{ label: "ฉบับร่าง", to: "/member/packages/draft" }} />

      <div className="flex justify-between mb-4">
        <SearchBarTable value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <button
          className="px-3 py-2 border rounded-form text-white flex items-center hover:bg-green-900"
          style={{ backgroundColor: "#055035" }}
          onClick={() => (window.location.href = "/member/packages/create")}
        >
          <Plus size={18} className="mr-2" />
          เพิ่มแพ็กเกจ
        </button>
      </div>

    {/* ตารางแสดงรายการแพ็กเกจฉบับร่าง */}
      <DataTable<PackageItem>
        data={paginatedRows}
        columns={columns}
        getKey={(pkg) => pkg.id.toString()}
        bulkActions={selectedRows.length > 0 ? bulkActions : []}
        selectable
        onSelectedChange={(rows) => setSelectedRows(rows)}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, limit, currentPage: 1 }))}
        isLoading={isLoading}
        theme="brand"
      />
    {/* Modal ยืนยันการลบแพ็กเกจเเบบรายการเดียว */}
      <Modal
        open={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, pkg: null })}
      />
    {/* Modal ยืนยันการลบแพ็กเกจแบบหลายรายการ */}
      <Modal
        open={bulkDeleteModal.open}
        title="ลบแพ็กเกจหลายรายการ"
        text={`คุณต้องการลบทั้งหมด ${bulkDeleteModal.rows.length} รายการหรือไม่?`}
        confirmText="ลบทั้งหมด"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteModal({ open: false, rows: [] })}
      />
    </div>
  );
};

export default PackageDraftMember;
