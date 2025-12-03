/**
 * Component: PackageDraftAdmin (Admin)
 * Description: แสดงรายการแพ็กเกจที่อยู่ในสถานะ "ฉบับร่าง" (DRAFT)
 * หน้านี้ใช้สำหรับค้นหา, แสดงรายการ, และจัดการ (แก้ไข/ลบ)
 * Input: searchTerm, pagination (จาก UI)
 * Output: ตารางรายการแพ็กเกจ พร้อมฟังก์ชันจัดการแต่ละรายการ
 */

import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SearchBarTable";
import { Plus, Edit, Trash } from "lucide-react";
import Breadcrumb from "../../Components/BreadcrumbNavigation";
import { Modal } from "../../Components/Modal/Modal";

/**
 * Interface: Package
 * อธิบายโครงสร้างข้อมูลแพ็กเกจที่ใช้ในตาราง
 */
interface Package {
  id: string;
  name: string;
  community: string;
  overseer: string;
  status: string;
  [key: string]: unknown;
}

/**
 * Helper Function: debounce
 * วัตถุประสงค์: ลดจำนวนครั้งที่เรียก API เมื่อผู้ใช้พิมพ์ค้นหา
 * Input: function, wait(ms)
 * Output: function ที่ถูก delay
 */
function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PackageDraftAdmin = () => {
  /** State: รายการแพ็กเกจ */
  const [packages, setPackages] = useState<Package[]>([]);

  /** State: คำค้นหา */
  const [searchTerm, setSearchTerm] = useState("");

  /** State: โหลดข้อมูลหรือไม่ */
  const [loading, setLoading] = useState(false);

  /** State: การแบ่งหน้า (Pagination) */
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  /** State: Modal สำหรับยืนยันการลบ */
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    pkg: Package | null;
  }>({
    open: false,
    pkg: null,
  });

  /**
   * Function: fetchPackages
   * วัตถุประสงค์: โหลดรายการแพ็กเกจจาก API
   * Input: searchTerm, page, limit
   * Output: อัปเดต packages + pagination
   */
  const fetchPackages = async (search = "", page = 1, limit = 10) => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(
        `http://localhost:3000/api/admin/packages/draft?${query}`,
        { credentials: "include" }
      );

      const result = await res.json();

      /** แปลงข้อมูลจาก backend → รูปแบบที่ UI ใช้ */
      const formatted: Package[] = Array.isArray(result.data)
        ? result.data.map((pkg: any) => ({
            id: pkg.id ?? pkg.name,
            name: pkg.name ?? "-",
            community: pkg.community?.name ?? "-",
            overseer: pkg.overseerPackage?.username ?? "-",
            status:
              pkg.statusPackage === "DRAFT"
                ? "ฉบับร่าง"
                : pkg.statusPackage ?? "-",
          }))
        : [];

      setPackages(formatted);

      /** อัปเดตข้อมูล pagination */
      setPagination((prev) => ({
        ...prev,
        totalCount: result.totalCount ?? formatted.length,
        totalPages: result.totalCount
          ? Math.ceil(result.totalCount / prev.limit)
          : 1,
        currentPage: page,
        limit,
      }));
    } catch (err) {
      console.error("Fetch error:", err);

      setPackages([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  /** Debounce: ป้องกันการเรียก API ถี่เกินไปตอนค้นหา */
  const debouncedFetch = useCallback(debounce(fetchPackages, 300), []);

  /**
   * Effect: โหลดข้อมูลแพ็กเกจทุกครั้งที่มีการค้นหา หรือเปลี่ยนหน้า
   */
  useEffect(() => {
    debouncedFetch(searchTerm, pagination.currentPage, pagination.limit);
  }, [searchTerm, pagination.currentPage, pagination.limit, debouncedFetch]);

  /**
   * Function: handleEdit
   * วัตถุประสงค์: ไปหน้าแก้ไขแพ็กเกจ
   */
  const handleEdit = (pkg: Package) => {
    window.location.href = `/admin/package/${pkg.id}/edit`;
  };

  /**
   * Function: handleDelete
   * วัตถุประสงค์: เปิด Modal เพื่อยืนยันการลบ
   */
  const handleDelete = (pkg: Package) => {
    setDeleteModal({
      open: true,
      pkg,
    });
  };

  /**
   * Function: confirmDelete
   * วัตถุประสงค์: ลบแพ็กเกจออกจากระบบ + อัปเดต UI
   */
  const confirmDelete = async () => {
    if (!deleteModal.pkg) return;

    const pkgId = deleteModal.pkg.id;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/package/${pkgId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("ลบไม่สำเร็จ");
        return;
      }

      /** ลบจาก state เพื่อให้ UI อัปเดตทันที */
      setPackages((prev) => prev.filter((item) => item.id !== pkgId));

      /** โหลดข้อมูลใหม่เพื่อ sync pagination */
      await fetchPackages(
        searchTerm,
        pagination.currentPage,
        pagination.limit
      );
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteModal({ open: false, pkg: null });
    }
  };

  /**
   * Table Columns: กำหนดคอลัมน์ของ DataTable
   */
  const columns: Column<Package>[] = [
    {
      key: "name",
      header: "ชื่อแพ็กเกจ",
      render: (pkg) => (
        <span
          className="cursor-pointer"
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
    { key: "status", header: "สถานะแพ็กเกจ" },
    {
      key: "setting",
      header: "จัดการ",
      render: (pkg) => (
        <div className="flex space-x-2">
          <Edit
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => handleEdit(pkg)}
          />
          <Trash
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => handleDelete(pkg)}
          />
        </div>
      ),
    },
  ];

  /**
   * Section: Render UI Layout
   * ประกอบด้วย Breadcrumb, SearchBar, Button, Table, Modal
   */
  return (
    <div className="font-sarabun bg-[#F0F0F0]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        current={{
          label: "ฉบับร่าง",
          to: "/admin/packages/draft",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[20px] font-medium">ฉบับร่าง</h1>
      </div>

      {/* Search Bar + Add Button */}
      <div className="flex items-center justify-between mb-3 font-sarabun">
        <SearchBarTable
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />

        <button
          onClick={() => (window.location.href = "/admin/packages/create")}
          className="flex items-center border text-white px-4 py-2 rounded-md transition h-10"
          style={{ backgroundColor: "#055035" }}
        >
          <Plus size={18} className="mr-2" />
          <div className="text-[14px] font-bold">เพิ่มแพ็กเกจ</div>
        </button>
      </div>

      {/* Data Table */}
      <DataTable<Package>
        data={packages}
        columns={columns}
        getKey={(pkg) => pkg.id}
        pageSizeOptions={[10, 30, 50]}
        pagination={pagination}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, currentPage: newPage }))
        }
        onPageSizeChange={(newLimit) =>
          setPagination((prev) => ({
            ...prev,
            limit: newLimit,
            currentPage: 1,
          }))
        }
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        title="ยืนยันการลบแพ็กเกจ"
        text={"คุณต้องการยืนยันการลบแพ็กเกจหรือไม่"}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, pkg: null })}
      />
    </div>
  );
};

export default PackageDraftAdmin;
