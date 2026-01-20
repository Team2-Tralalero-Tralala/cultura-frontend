/**
 * คำอธิบาย: จัดการรายการแพ็กเกจฉบับร่าง (Draft) ของ Admin
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import DataTable, { type Column } from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Modal } from "@/Components/Modal/Modal";
import type { BulkAction } from "@/Components/Tables/Types";
import { TrashIcon, PencilIcon } from "@/Components/Tables/Icon";
import { useNavigate } from "react-router-dom";

type DraftPackageRow = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
};

/**
 * คำอธิบาย: ฟังก์ชันจัดรูปแบบข้อความให้เป็นมาตรฐานก่อนนำไปค้นหา
 * Input: text (any)
 * Output: string ที่ถูก trim, lowercase และ normalize
 */
const normalizeText = (text: any) =>
  (text ?? "").toString().trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");

/**
 * คำอธิบาย: ฟังก์ชันหลักสำหรับหน้าจัดการแพ็กเกจฉบับร่างของผู้ดูแลระบบ (Super Admin)
 * Input: -
 * Output: JSX.Element (หน้าจอแสดงตารางรายการแพ็กเกจฉบับร่างและการจัดการ)
 */
export default function ManageDraftPackagePage() {
  const navigate = useNavigate();
  const [draftPackages, setDraftPackages] = useState<DraftPackageRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [selectedRows, setSelectedRows] = useState<DraftPackageRow[]>([]);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pkg: null as DraftPackageRow | null,
  });

  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    isOpen: false,
    rows: [] as DraftPackageRow[],
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * คำอธิบาย: ฟังก์ชันดึงรายการแพ็กเกจฉบับร่างจาก API และจัดรูปแบบข้อมูลก่อนนำไปแสดงผล
   * Input: ไม่มี
   * Output: อัปเดต state draftPackages และ pagination
   */
  const fetchDraftPackages = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(`${API_URL}/admin/packages/draft`, {
        withCredentials: true,
      });

      const result = res.data;

      const formatted: DraftPackageRow[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? 0,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.name ?? "-",
            status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage,
          }))
        : [];

      setDraftPackages(formatted);

      setPagination((prev) => ({
        ...prev,
        totalCount: formatted.length,
        totalPages: Math.ceil(formatted.length / prev.limit),
      }));
    } catch (error) {
      console.error("Failed to fetch draft packages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDraftPackages();
  }, [fetchDraftPackages]);

  /**
   * คำอธิบาย: ฟังก์ชันกรองรายการแพ็กเกจตามคำค้นหา (ค้นหาฝั่ง Client)
   * Input: searchTerm, draftPackages
   * Output: รายการแพ็กเกจที่ผ่านเงื่อนไขการค้นหา
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return draftPackages;

    return draftPackages.filter((pkg) => {
      const fields = [pkg.name, pkg.community, pkg.overseer, pkg.status].map(normalizeText);

      return fields.some((text) => text.includes(query));
    });
  }, [draftPackages, searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / prev.limit),
    }));
  }, [filteredRows]);

  const paginatedRows = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredRows.slice(start, start + pagination.limit);
  }, [filteredRows, pagination.currentPage, pagination.limit]);

  /**
   * คำอธิบาย: ฟังก์ชันลบแพ็กเกจฉบับร่างทีละรายการ
   * Input: deleteModal.pkg
   * Output: ลบข้อมูลจากระบบและโหลดข้อมูลใหม่
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.pkg) return;

    const pkgToDelete = deleteModal.pkg;
    setDeleteModal({ isOpen: false, pkg: null });

    try {
      await axios.delete(`${API_URL}/admin/packages/draft/${pkgToDelete.id}`, {
        withCredentials: true,
      });
      fetchDraftPackages();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชันลบหลายรายการพร้อมกัน
   * Input: bulkDeleteModal.rows
   * Output: ลบข้อมูลทั้งหมดและโหลดใหม่
   */
  const handleConfirmBulkDelete = async () => {
    const ids = bulkDeleteModal.rows.map((r) => r.id);

    setBulkDeleteModal({ isOpen: false, rows: [] });

    try {
      await axios.patch(
        `${API_URL}/admin/packages/draft/bulk-delete`,
        { ids },
        { withCredentials: true },
      );

      setSelectedRows([]);
      fetchDraftPackages();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  const bulkActions: BulkAction<DraftPackageRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: (rows) => setBulkDeleteModal({ isOpen: true, rows }),
    },
  ];

  const columns: Column<DraftPackageRow>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (pkg) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() => navigate(`/admin/package/${pkg.id}`)}
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
        <div className="flex space-x-2 gap-2">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => navigate(`/admin/package/${pkg.id}/edit`)}
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="cursor-pointer"
            onClick={() => setDeleteModal({ isOpen: true, pkg })}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-sarabun bg-[#F0F0F0] space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb current={{ label: "ฉบับร่าง", to: "/admin/packages/draft" }} />

      {/* Toolbar */}
      <div className="flex justify-between mb-4">
        <div className="w-[260px]">
          <SearchBarTable value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <button
          className="px-3 py-2 border rounded-form text-white flex items-center hover:bg-green-900"
          style={{ backgroundColor: "#055035" }}
          onClick={() => navigate("/admin/package/create")}
        >
          <Plus size={18} className="mr-2" />
          เพิ่มแพ็กเกจ
        </button>
      </div>

      {/* Table */}
      <DataTable<DraftPackageRow>
        data={paginatedRows}
        columns={columns}
        getKey={(pkg) => pkg.id.toString()}
        bulkActions={selectedRows.length > 0 ? bulkActions : []}
        selectable
        onSelectedChange={(rows) => setSelectedRows(rows)}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, currentPage: p }))}
        onPageSizeChange={(limit) =>
          setPagination((prev) => ({
            ...prev,
            limit,
            currentPage: 1,
          }))
        }
        isLoading={isLoading}
        theme="brand"
      />

      {/* Modal : ลบเดี่ยว */}
      <Modal
        open={deleteModal.isOpen}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, pkg: null })}
      />

      {/* Modal : ลบหลายรายการ */}
      <Modal
        open={bulkDeleteModal.isOpen}
        title="ลบแพ็กเกจหลายรายการ"
        text={`คุณต้องการลบทั้งหมด ${bulkDeleteModal.rows.length} รายการหรือไม่?`}
        confirmText="ลบทั้งหมด"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteModal({ isOpen: false, rows: [] })}
      />
    </div>
  );
}
