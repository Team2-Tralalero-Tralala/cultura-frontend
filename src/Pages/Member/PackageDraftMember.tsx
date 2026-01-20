/**
 * คำอธิบาย : Component หน้าจัดการเเพ็กเกจฉบับร่าง (Draft) ของ Member
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

interface PackageItem {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
}

const API_BASE = "http://localhost:3000/api";

/*
 * คำอธิบาย : ฟังก์ชันจัดรูปแบบข้อความให้เป็นมาตรฐานก่อนนำไปใช้ค้นหา
 * Input : value (unknown)
 * Output : ข้อความที่ผ่านการ trim, lowercase และ normalize แล้ว
 */
function normalizeText(value: unknown): string {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ");
}

/*
 * คำอธิบาย : ฟังก์ชันคอมโพเนนต์สำหรับแสดงรายการแพ็กเกจฉบับร่างของสมาชิก
 * Input : ไม่มี
 * Output : แสดงหน้าจอรายการแพ็กเกจฉบับร่าง พร้อมค้นหา ลบ และจัดการข้อมูล
 */
const PackageDraftMember: React.FC = () => {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [selectedRows, setSelectedRows] = useState<PackageItem[]>([]);

  const [isDeleteModal, setIsDeleteModal] = useState<{
    open: boolean;
    pkg: PackageItem | null;
  }>({
    open: false,
    pkg: null,
  });

  const [isBulkDeleteModal, setIsBulkDeleteModal] = useState<{
    open: boolean;
    rows: PackageItem[];
  }>({
    open: false,
    rows: [],
  });

  /*
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลแพ็กเกจฉบับร่างของสมาชิกจาก API
   * Input : ไม่มี
   * Output : อัปเดต state รายการแพ็กเกจและข้อมูล pagination
   */
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/member/packages/draft`,
        {
          withCredentials: true,
        }
      );

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const formatted: PackageItem[] = data.map(
        (packageItem: any) => ({
          id: packageItem.id ?? 0,
          name: packageItem.name ?? "-",
          community: packageItem.community?.name ?? "-",
          overseer:
            packageItem.overseerPackage?.username ?? "-",
          status:
            packageItem.statusPackage === "DRAFT"
              ? "ฉบับร่าง"
              : packageItem.statusPackage ?? "-",
        })
      );

      setItems(formatted);
      setPagination((prev) => ({
        ...prev,
        totalCount: formatted.length,
        totalPages: Math.max(
          1,
          Math.ceil(formatted.length / prev.limit)
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPackages();
  }, [fetchPackages]);

  /*
   * คำอธิบาย : ฟังก์ชันกรองรายการแพ็กเกจตามคำค้นหา
   * Input : items, searchTerm
   * Output : รายการแพ็กเกจที่ผ่านเงื่อนไขการค้นหา
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return items;

    return items.filter((packageItem) => {
      const values = [
        packageItem.name,
        packageItem.community,
        packageItem.overseer,
        packageItem.status,
      ].map(normalizeText);

      return values.some((value) =>
        value.includes(query)
      );
    });
  }, [items, searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: filteredRows.length,
      totalPages: Math.max(
        1,
        Math.ceil(filteredRows.length / prev.limit)
      ),
    }));
  }, [filteredRows]);

  /*
   * คำอธิบาย : ฟังก์ชันแบ่งหน้าข้อมูลแพ็กเกจหลังจากผ่านการกรอง
   * Input : filteredRows, pagination.currentPage, pagination.limit
   * Output : รายการแพ็กเกจตามหน้าที่เลือก
   */
  const paginatedRows = useMemo(() => {
    const start =
      (pagination.currentPage - 1) *
      pagination.limit;
    return filteredRows.slice(
      start,
      start + pagination.limit
    );
  }, [
    filteredRows,
    pagination.currentPage,
    pagination.limit,
  ]);

  /*
   * คำอธิบาย : ฟังก์ชันลบแพ็กเกจฉบับร่างแบบรายการเดียว
   * Input : deleteModal.pkg
   * Output : ลบแพ็กเกจและโหลดข้อมูลใหม่
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!isDeleteModal.pkg) return;

    const idToDelete = isDeleteModal.pkg.id;
    setIsDeleteModal({ open: false, pkg: null });

    try {
      await axios.delete(
        `${API_BASE}/member/packages/draft/${idToDelete}`,
        { withCredentials: true }
      );
      void fetchPackages();
    } catch {}
  }, [isDeleteModal, fetchPackages]);

  /*
   * คำอธิบาย : ฟังก์ชันลบแพ็กเกจฉบับร่างหลายรายการพร้อมกัน
   * Input : bulkDeleteModal.rows
   * Output : ลบแพ็กเกจทั้งหมดที่เลือกและโหลดข้อมูลใหม่
   */
  const handleConfirmBulkDelete = useCallback(
    async () => {
      const ids = isBulkDeleteModal.rows.map(
        (row) => row.id
      );
      setIsBulkDeleteModal({ open: false, rows: [] });

      if (ids.length === 0) return;

      try {
        await axios.patch(
          `${API_BASE}/member/packages/draft/bulk-delete`,
          { ids },
          { withCredentials: true }
        );
        setSelectedRows([]);
        void fetchPackages();
      } catch {}
    },
    [isBulkDeleteModal, fetchPackages]
  );

  const bulkActions: BulkAction<PackageItem>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) =>
        `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: (rows) =>
        setIsBulkDeleteModal({ open: true, rows }),
    },
  ];

  const columns: Column<PackageItem>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (packageItem) => (
        <span
          className="cursor-pointer hover:text-gray-800"
          onClick={() =>
            (window.location.href = `/member/package/${packageItem.id}`)
          }
        >
          {packageItem.name}
        </span>
      ),
    },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ผู้ดูแล" },
    { key: "status", header: "สถานะแพ็กเกจ" },
    {
      key: "setting",
      header: "จัดการ",
      render: (packageItem) => (
        <div className="flex space-x-2">
          <span
            className="cursor-pointer"
            onClick={() =>
              (window.location.href = `/member/package/${packageItem.id}/edit`)
            }
          >
            <PencilIcon className="w-4 h-4" />
          </span>
          <span
            className="cursor-pointer"
            onClick={() =>
              setIsDeleteModal({
                open: true,
                pkg: packageItem,
              })
            }
          >
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      <Breadcrumb
        current={{
          label: "ฉบับร่าง",
          to: "/member/packages/draft",
        }}
      />
      <h1 className="text-xl font-bold ">ฉบับร่าง</h1>
      <div className="flex justify-between mb-4 text-16px">
        <SearchBarTable
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <button
          className="px-3 py-2 border rounded-form text-white flex items-center hover:bg-green-900"
          style={{ backgroundColor: "#055035" }}
          onClick={() =>
            (window.location.href =
              "/member/packages/create")
          }
        >
          <Plus size={18} className="mr-2" />
          สร้างแพ็กเกจ
        </button>
      </div>

      <DataTable<PackageItem>
        data={paginatedRows}
        columns={columns}
        getKey={(packageItem) =>
          packageItem.id.toString()
        }
        bulkActions={
          selectedRows.length > 0 ? bulkActions : []
        }
        selectable
        onSelectedChange={(rows) =>
          setSelectedRows(rows)
        }
        pagination={pagination}
        pageSizeOptions={[10, 30, 50]}
        onPageChange={(page) =>
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
          }))
        }
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

      <Modal
        open={isDeleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setIsDeleteModal({ open: false, pkg: null })
        }
      />

      <Modal
        open={isBulkDeleteModal.open}
        title="ลบแพ็กเกจหลายรายการ"
        text={`คุณต้องการลบทั้งหมด ${isBulkDeleteModal.rows.length} รายการหรือไม่?`}
        confirmText="ลบทั้งหมด"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() =>
          setIsBulkDeleteModal({
            open: false,
            rows: [],
          })
        }
      />
    </div>
  );
};

export default PackageDraftMember;
