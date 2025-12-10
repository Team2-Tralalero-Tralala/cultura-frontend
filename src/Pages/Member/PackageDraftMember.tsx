/*
 * คำอธิบาย : Component สำหรับแสดงรายการแพ็กเกจ (ฉบับร่าง) สำหรับแอดมิน
 * หน้าที่ : ใช้สำหรับแสดงตารางแพ็กเกจฉบับร่าง รองรับการค้นหา เลือกหลายรายการ ลบแบบเดี่ยว/หลายรายการ และ Pagination
 * Input : ไม่มี (ดึงจาก API โดยตรง)
 * Output : ตารางรายการแพ็กเกจฉบับร่าง พร้อมปุ่มเพิ่ม/แก้ไข/ลบ และการแบ่งหน้า
 */

import React, { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import axios from "axios";

// ================= Import UI Components =================
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";

// ================= Types =================
import type { BulkAction } from "../../Components/Tables/Types";
import { TrashIcon, PencilIcon } from "../../Components/Tables/Icon";

// ================= Interface =================
/*
 * คำอธิบาย : โครงสร้างข้อมูลแพ็กเกจที่นำมาใช้ในตาราง
 */
type Package = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
};

// ================= Utility =================
/*
 * คำอธิบาย : ฟังก์ชัน debounce ใช้หน่วงเวลาค้นหา เพื่อลดจำนวนครั้งในการยิง API
 * Input : fn (callback), delay (ms)
 * Output : ฟังก์ชันที่ถูก debounce แล้ว
 */
function debounce<F extends (...args: any[]) => any>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ================= Component หลัก =================
const PackageDraftMember = () => {
  // ====== State: Data & Loading ======
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ====== Pagination ======
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  // ====== State: เลือกหลายรายการ ======
  const [selectedRows, setSelectedRows] = useState<Package[]>([]);

  // ====== Modal: ลบเดี่ยว ======
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    pkg: Package | null;
  }>({
    open: false,
    pkg: null,
  });

  // ====== Modal: ลบหลายรายการ ======
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{
    open: boolean;
    rows: Package[];
  }>({
    open: false,
    rows: [],
  });

  // ================= API: โหลดข้อมูลแพ็กเกจ =================
  /*
   * คำอธิบาย : ฟังก์ชันโหลดรายการแพ็กเกจฉบับร่างจาก API
   * Input : search, page, limit
   * Output : เซตข้อมูลลงใน state packages
   */
  const fetchPackages = async (search = "", page = 1, limit = 10) => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/member/packages/draft?search=${search}&page=${page}&limit=${limit}`,
        { credentials: "include" }
      );

      const result = await res.json();
      const formatted: Package[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? 0,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.username ?? "-",
            status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage,
          }))
        : [];

      setPackages(formatted);

      setPagination((prev) => ({
        ...prev,
        totalCount: result.totalCount ?? formatted.length,
        totalPages: result.totalCount
          ? Math.ceil(result.totalCount / prev.limit)
          : 1,
        currentPage: page,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Debounce สำหรับ search
  const debouncedFetch = useCallback(debounce(fetchPackages, 300), []);

  // โหลดข้อมูลเมื่อเปลี่ยน search / page / limit
  useEffect(() => {
    debouncedFetch(searchTerm, pagination.currentPage, pagination.limit);
  }, [searchTerm, pagination.currentPage, pagination.limit]);

  // ================= ลบเดี่ยว =================
  /*
   * คำอธิบาย : ฟังก์ชันลบแพ็กเกจเดี่ยว
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.pkg) return;
    setDeleteModal({ open: false, pkg: null });

    try {
      await axios.delete(
        `http://localhost:3000/api/member/packages/draft/${deleteModal.pkg.id}`,
        { withCredentials: true }
      );

      await fetchPackages(searchTerm, pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= ลบหลายรายการ =================
  /*
   * คำอธิบาย : ฟังก์ชันลบหลายแพ็กเกจพร้อมกัน (Bulk Delete)
   */
  const handleConfirmBulkDelete = async () => {
    const ids = bulkDeleteModal.rows.map((r) => r.id);
    setBulkDeleteModal({ open: false, rows: [] });

    try {
      await axios.patch(
        `http://localhost:3000/api/member/packages/draft/bulk-delete`,
        { ids },
        { withCredentials: true }
      );

      setSelectedRows([]); // ล้าง selection ทันที

      await fetchPackages(searchTerm, pagination.currentPage, pagination.limit);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  // ================= Bulk Actions =================
  const bulkActions: BulkAction<Package>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: (rows) => {
        setBulkDeleteModal({ open: true, rows });
      },
    },
  ];

  // ================= Columns =================
  const columns: Column<Package>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (pkg) => (
        <span
          className="cursor-pointer text-gray-600 hover:text-gray-800"
          onClick={() => (window.location.href = `/member/package/${pkg.id}`)}
        >
          {pkg.name}
        </span>
      ),
    },
    { key: "community", header: "ชื่อชุมชน",
      render: (pkg) => (
        <span
          className=" text-gray-600 "
        >
          {pkg.community}
        </span>
      ),
     },
    { key: "overseer", header: "ชื่อผู้ดูแล",
      render: (pkg) => (
        <span
          className=" text-gray-600 "
        >
          {pkg.overseer}
        </span>
      ), },
    { key: "status", header: "สถานะ" ,
      
      render: (pkg) => (
        <span
          className=" text-gray-600 "
        >
          {pkg.status}
        </span>
      ),
    },
    {
      key: "setting",
      header: "จัดการ",
      render: (pkg) => (
        <div className="flex space-x-2">
          <span
            className="cursor-pointer text-gray-500"
            onClick={() => (window.location.href = `/member/package/${pkg.id}/edit`)}
          >
            <PencilIcon className="w-5 h-5" />
          </span>

          <span
            className="cursor-pointer text-gray-500"
            onClick={() => setDeleteModal({ open: true, pkg })}
          >
            <TrashIcon className="w-5 h-5" />
          </span>
        </div>
      ),
    },
  ];

  // ================= Render =================
  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      {/* Breadcrumb */}
      <Breadcrumb current={{ label: "ฉบับร่าง", to: "/member/packages/draft" }} />

      {/* Toolbar: Search + Add button */}
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

      {/* Table */}
      <DataTable<Package>
        data={packages}
        columns={columns}
        getKey={(pkg) => pkg.id.toString()}
        bulkActions={selectedRows.length > 0 ? bulkActions : []}
        selectable
        onSelectedChange={(rows) => setSelectedRows(rows)}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, currentPage: p }))}
        onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, limit, currentPage: 1 }))}
        isLoading={loading}
        theme="brand"
      />
      {/* Modal: Delete single */}
      <Modal
        open={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, pkg: null })}
      />

      {/* Modal: Delete multiple */}
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