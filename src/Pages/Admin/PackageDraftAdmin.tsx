/*
 * Component : จัดการรายการแพ็กเกจฉบับร่าง (Draft)
 * รายละเอียด : แสดงรายการแพ็กเกจฉบับร่าง พร้อมระบบค้นหาแบบ Client-side, การลบเดี่ยว, ลบหลายรายการ
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import axios from "axios";

// ================= Import Components =================
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";

import type { BulkAction } from "../../Components/Tables/Types";
import { TrashIcon, PencilIcon } from "../../Components/Tables/Icon";

// ================= Interface =================
type Package = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
};

// ================= Function : Normalize Text =================
/*
 * คำอธิบาย : ฟังก์ชันจัดรูปแบบข้อความให้เป็นมาตรฐานก่อนนำไปค้นหา
 * Input : text (any)
 * Output : string ที่ถูก trim, lowercase และ normalize
 */
const normalizeText = (text: any) =>
  (text ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ");

// =====================================================

const PackageDraftAdmin = () => {
  // ================= State =================
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

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

  // ================= Function : Fetch Data =================
  /*
   * คำอธิบาย : ดึงรายการแพ็กเกจฉบับร่างจาก API และจัดรูปแบบข้อมูลก่อนแสดงผล
   * Input : -
   * Output : อัปเดต state packages และ pagination
   */
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/admin/packages/draft`,
        { credentials: "include" }
      );

      const result = await res.json();

      const formatted: Package[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? 0,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.name ?? "-",
            status:
              pkg.statusPackage === "DRAFT"
                ? "ฉบับร่าง"
                : pkg.statusPackage,
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

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // ================= Search Filter (Client-side) =================
  /*
   * คำอธิบาย : กรองรายการใน Client จาก searchTerm
   * Input : searchTerm, packages
   * Output : rows ที่ผ่านการค้นหาแล้ว
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

  // อัปเดต Pagination เมื่อผลค้นหาเปลี่ยน
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / prev.limit),
    }));
  }, [filteredRows]);

  // ================= Pagination Logic =================
  /*
   * คำอธิบาย : คำนวณ rows ที่ต้องแสดงตามหน้าปัจจุบัน
   */
  const paginatedRows = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredRows.slice(start, start + pagination.limit);
  }, [filteredRows, pagination.currentPage, pagination.limit]);

  // ================= Function : Delete Single =================
  /*
   * คำอธิบาย : ลบแพ็กเกจรายการเดียว
   * Input : deleteModal.pkg
   * Output : ลบข้อมูลและโหลดใหม่
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.pkg) return;

    setDeleteModal({ open: false, pkg: null });

    try {
      await axios.delete(
        `http://localhost:3000/api/admin/packages/draft/${deleteModal.pkg.id}`,
        { withCredentials: true }
      );
      fetchPackages();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= Function : Delete Multiple =================
  /*
   * คำอธิบาย : ลบหลายรายการพร้อมกัน
   * Input : bulkDeleteModal.rows
   * Output : ลบข้อมูลทั้งหมดและโหลดใหม่
   */
  const handleConfirmBulkDelete = async () => {
    const ids = bulkDeleteModal.rows.map((r) => r.id);

    setBulkDeleteModal({ open: false, rows: [] });

    try {
      await axios.patch(
        `http://localhost:3000/api/admin/packages/draft/bulk-delete`,
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

  // ================= Columns =================
  const columns: Column<Package>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      /*
       * คลิกชื่อเพื่อไปยังหน้าแสดงรายละเอียดแพ็กเกจ
       */
      render: (pkg) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() =>
            (window.location.href = `/admin/package/${pkg.id}`)
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
       * ปุ่มแก้ไข และ ปุ่มลบ ในแต่ละแถว
       */
      render: (pkg) => (
        <div className="flex space-x-2 gap-2">
          <span
            className="cursor-pointer"
            onClick={() =>
              (window.location.href = `/admin/package/${pkg.id}/edit`)
            }
          >
            <PencilIcon className="w-4 h-4" />
          </span>

          <span
            className="cursor-pointer"
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
        current={{ label: "ฉบับร่าง", to: "/admin/packages/draft" }}
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
          onClick={() => (window.location.href = "/admin/package/create")}
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
        onPageChange={(p) =>
          setPagination((prev) => ({ ...prev, currentPage: p }))
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

      {/* Modal : ลบเดี่ยว */}
      <Modal
        open={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, pkg: null })}
      />

      {/* Modal : ลบหลายรายการ */}
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

export default PackageDraftAdmin;
