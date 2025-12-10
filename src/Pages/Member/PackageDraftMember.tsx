/*
 * Component : แสดงรายการแพ็กเกจฉบับร่าง (Member)
 * รายละเอียด : ระบบค้นหาแบบ Client-side, Pagination, ลบเดี่ยว / ลบหลายรายการ
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import axios from "axios";

// ================= Components =================
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";

import type { BulkAction } from "../../Components/Tables/Types";
import { TrashIcon, PencilIcon } from "../../Components/Tables/Icon";

// ================= Types ======================
type Package = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
};

// ================= Utils : Normalize Text =================
/*
 * คำอธิบาย : ฟังก์ชัน Normalize สำหรับใช้ในค้นหา
 * Input : text (any)
 * Output : string ที่ผ่านการ trim → lowercase → normalize แล้ว
 */
const normalizeText = (text: any) =>
  (text ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ");

// =========================================================

const PackageDraftMember = () => {
  // ================= State =================
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  // Rows ที่ถูกเลือก
  const [selectedRows, setSelectedRows] = useState<Package[]>([]);

  // Modal ลบเดี่ยว
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    pkg: null as Package | null,
  });

  // Modal ลบหลายรายการ
  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    open: false,
    rows: [] as Package[],
  });

  // ================= Load Data from API =================
  /*
   * คำอธิบาย : ดึงข้อมูลแพ็กเกจฉบับร่างของ Member และจัดรูปแบบก่อนใช้งาน
   * Output : setPackages + อัปเดต pagination
   */
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/member/packages/draft`,
        { credentials: "include" }
      );

      const result = await res.json();

      const formatted: Package[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? 0,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.username ?? "-",
            status:
              pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage,
          }))
        : [];

      setPackages(formatted);

      setPagination((prev) => ({
        ...prev,
        totalCount: formatted.length,
        totalPages: Math.ceil(formatted.length / prev.limit),
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดครั้งแรก
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // ================= Search (Client-side) =================
  /*
   * คำอธิบาย : กรองผลลัพธ์ตาม searchTerm โดยใช้ normalizeText
   * Output : รายการที่ผ่านการค้นหาแล้ว
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return packages;

    return packages.filter((pkg) => {
      const fields = [
        pkg.name,
        pkg.community,
        pkg.overseer,
        pkg.status,
      ].map(normalizeText);

      return fields.some((text) => text.includes(query));
    });
  }, [packages, searchTerm]);

  // เมื่อผลค้นหาเปลี่ยน → อัปเดต pagination
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / prev.limit),
    }));
  }, [filteredRows]);

  // ================= Pagination : Slice Rows =================
  /*
   * คำอธิบาย : คำนวณ rows ตามหน้าปัจจุบัน
   */
  const paginatedRows = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredRows.slice(start, start + pagination.limit);
  }, [filteredRows, pagination.currentPage, pagination.limit]);

  // ================= Delete Single =================
  /*
   * คำอธิบาย : ลบรายการเดี่ยวจาก API
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.pkg) return;

    setDeleteModal({ open: false, pkg: null });

    try {
      await axios.delete(
        `http://localhost:3000/api/member/packages/draft/${deleteModal.pkg.id}`,
        { withCredentials: true }
      );

      fetchPackages();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= Delete Multiple =================
  /*
   * คำอธิบาย : ลบหลายรายการพร้อมกัน
   */
  const handleConfirmBulkDelete = async () => {
    const ids = bulkDeleteModal.rows.map((row) => row.id);

    setBulkDeleteModal({ open: false, rows: [] });

    try {
      await axios.patch(
        `http://localhost:3000/api/member/packages/draft/bulk-delete`,
        { ids },
        { withCredentials: true }
      );

      setSelectedRows([]);
      fetchPackages();
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
      onClick: (rows) => setBulkDeleteModal({ open: true, rows }),
    },
  ];

  // ================= Table Columns =================
  const columns: Column<Package>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      /*
       * คลิก → ไปหน้ารายละเอียดแพ็กเกจ
       */
      render: (pkg) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() =>
            (window.location.href = `/member/package/${pkg.id}`)
          }
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
      /*
       * ปุ่มแก้ไข & ลบ
       */
      render: (pkg) => (
        <div className="flex space-x-2">
          <span
            className="cursor-pointer "
            onClick={() =>
              (window.location.href = `/member/package/${pkg.id}/edit`)
            }
          >
            <PencilIcon className="w-4 h-4" />
          </span>

          <span
            className="cursor-pointer "
            onClick={() => setDeleteModal({ open: true, pkg })}
          >
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      ),
    },
  ];

  // ================= Render =================
  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      {/* Breadcrumb */}
      <Breadcrumb
        current={{ label: "ฉบับร่าง", to: "/member/packages/draft" }}
      />

      {/* Toolbar */}
      <div className="flex justify-between mb-4">
        <SearchBarTable
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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
        data={paginatedRows}
        columns={columns}
        getKey={(pkg) => pkg.id.toString()}
        bulkActions={selectedRows.length > 0 ? bulkActions : []}
        selectable
        onSelectedChange={(rows) => setSelectedRows(rows)}
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        onPageSizeChange={(limit) =>
          setPagination((prev) => ({
            ...prev,
            limit,
            currentPage: 1,
          }))
        }
        isLoading={loading}
        theme="brand"
      />

      {/* Modal Delete Single */}
      <Modal
        open={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, pkg: null })}
      />

      {/* Modal Delete Multiple */}
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
