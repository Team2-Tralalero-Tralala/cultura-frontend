/*
 * Component : จัดการรายการแพ็กเกจฉบับร่าง (Draft) ของ Admin
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";
import type { BulkAction } from "../../Components/Tables/Types";
import { TrashIcon, PencilIcon } from "../../Components/Tables/Icon";

type Package = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
};

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

/*
 * คำอธิบาย : คอมโพเนนต์สำหรับแสดงรายการแพ็กเกจฉบับร่างของผู้ดูแลระบบ
 * Input : ไม่มี
 * Output : แสดงหน้าจอรายการแพ็กเกจฉบับร่าง พร้อมค้นหา ลบ และจัดการข้อมูล
 */
const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [selectedRows, setSelectedRows] = useState<Package[]>([]);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    packageObject: null as Package | null,
  });

  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    open: false,
    rows: [] as Package[],
  });

  /*
   * คำอธิบาย : ฟังก์ชันดึงรายการแพ็กเกจฉบับร่างจาก API และจัดรูปแบบข้อมูลก่อนนำไปแสดงผล
   * Input : ไม่มี
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
        ? result.data.map((packageObject: any) => ({
            id: packageObject.id ?? 0,
            name: packageObject.name ?? "-",
            community: packageObject.community?.name ?? "-",
            overseer: packageObject.overseerPackage?.name ?? "-",
            status: packageObject.statusPackage === "DRAFT" ? "ฉบับร่าง" : packageObject.statusPackage,
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

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  /*
   * คำอธิบาย : ฟังก์ชันกรองรายการแพ็กเกจตามคำค้นหา (ค้นหาฝั่ง Client)
   * Input : searchTerm, packages
   * Output : รายการแพ็กเกจที่ผ่านเงื่อนไขการค้นหา
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return packages;

    return packages.filter((packageObject) => {
      const fields = [packageObject.name, packageObject.community, packageObject.overseer, packageObject.status].map(normalizeText);

      return fields.some((text) => text.includes(query));
    });
  }, [packages, searchTerm]);

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

  /*
   * คำอธิบาย : ฟังก์ชันลบแพ็กเกจฉบับร่างทีละรายการ
   * Input : deleteModal.pkg
   * Output : ลบข้อมูลจากระบบและโหลดข้อมูลใหม่
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.packageObject) return;

    setDeleteModal({ open: false, packageObject: null });

    try {
      await axios.delete(`http://localhost:3000/api/admin/packages/draft/${deleteModal.packageObject.id}`, {
        withCredentials: true,
      });
      fetchPackages();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชันลบหลายรายการพร้อมกัน
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
        { withCredentials: true },
      );

      setSelectedRows([]);
      fetchPackages();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

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

  const columns: Column<Package>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (packageObject) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() => (window.location.href = `/admin/package/${packageObject.id}`)}
        >
          {packageObject.name}
        </span>
      ),
    },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ชื่อผู้ดูแล" },
    { key: "status", header: "สถานะ" },

    {
      key: "setting",
      header: "จัดการ",
      render: (packageObject) => (
        <div className="flex space-x-2 gap-2">
          <span
            className="cursor-pointer"
            onClick={() => (window.location.href = `/admin/package/${packageObject.id}/edit`)}
          >
            <PencilIcon className="w-4 h-4" />
          </span>

          <span className="cursor-pointer" onClick={() => setDeleteModal({ open: true, packageObject })}>
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      {/* Breadcrumb */}
      <Breadcrumb current={{ label: "ฉบับร่าง", to: "/admin/packages/draft" }} />

      {/* Toolbar */}
      <div className="flex justify-between mb-4">
        <SearchBarTable value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />

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
        onPageChange={(pagination) => setPagination((prev) => ({ ...prev, currentPage: pagination }))}
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
        isOpen={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, packageObject: null })}
      />

      {/* Modal : ลบหลายรายการ */}
      <Modal
        isOpen={bulkDeleteModal.open}
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
