/*
 * หน้า: จัดการที่พัก (Super Admin)
 * คำอธิบาย :
 *   - แสดงตารางรายการที่พักในชุมชน
 *   - รองรับค้นหา / ลบทีละรายการ / ลบหลายรายการ (Bulk Delete)
 *   - Breadcrumb อิง Component กลาง
 *   - Role: SuperAdmin เท่านั้น
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* Components */
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import { Modal } from "@/Components/Modal/Modal";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { TrashIcon } from "@/Components/Tables/Icon";

/* Services */
import { getHomestaysAll, deleteHomestayBySuperAdmin } from "@/Services/homestay-services";
import { getCommunityById } from "@/Services/community-service";

/* Types */
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";

// ================= Types =================
type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

// ================= Utilities =================
const normalizeText = (s: string) =>
  (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

// ================= Component =================
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // ====== Data State ======
  const [communityName, setCommunityName] = useState("-");
  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ====== Pagination & Search State ======
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ====== Delete State ======
  const [selectedRows, setSelectedRows] = useState<HomestayRow[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenBulkConfirm, setIsOpenBulkConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 🔥 ป้องกัน modal เด้งซ้ำ

  // ================= Load Community Name =================
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) return;
        const res = await getCommunityById(Number(communityId));
        setCommunityName(res.data?.data?.name ?? "-");
      } catch (error) {
        console.error(error);
      }
    }
    fetchCommunity();
  }, [communityId]);

  // ================= Load Homestays Data =================
  const fetchData = useCallback(async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data } = await getHomestaysAll(Number(communityId), currentPage, pageSize);
      const payload = data?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];

      setRows(
        list.map((h: any) => ({
          id: h.id,
          name: h.name ?? "-",
          facility: h.facility ?? "-",
          type: h.type ?? "-",
        }))
      );

      setTotalPages(payload?.pagination?.totalPages ?? 1);
      setTotalCount(payload?.pagination?.totalCount ?? list.length);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [communityId, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= Search Filter =================
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.facility, r.type].some((v) => normalizeText(v).includes(q))
    );
  }, [rows, searchQuery]);

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;

    setIsDeleting(true);
    setIsOpenConfirm(false);

    const idToDelete = deleteId;
    setDeleteId(null);

    try {
      await deleteHomestayBySuperAdmin(idToDelete);
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบที่พักได้");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0 || isDeleting) return;

    setIsDeleting(true);
    setIsOpenBulkConfirm(false);

    const ids = selectedRows.map((r) => r.id);
    setSelectedRows([]);

    try {
      await Promise.all(ids.map((id) => deleteHomestayBySuperAdmin(id)));
      setRows((prev) => prev.filter((row) => !ids.includes(row.id)));
      setTotalCount((prev) => prev - ids.length);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบหลายรายการได้");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsOpenConfirm(false);
    setDeleteId(null);
  };

  const handleCancelBulkDelete = () => {
    setIsOpenBulkConfirm(false);
    setSelectedRows([]);
  };

  const columns: Column<HomestayRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "ชื่อที่พัก",
        className: "min-w-[200px]",
        render: (row) => (
          <Link
            to={`/super/community/${communityId}/homestay/${row.id}`}
            className="text-dark-green font-medium hover:underline"
          >
            {row.name}
          </Link>
        ),
      },
      {
        key: "facility",
        header: "สิ่งอำนวยความสะดวก",
      },
      {
        key: "type",
        header: "ประเภทห้อง",
      },
    ],
    [communityId]
  );

  /* ---------------- Row Actions ---------------- */
  const rowActions: DataTableActionsConfig<HomestayRow> = useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/super/community/${communityId}/homestay/${row.id}/edit`),
        delete: (row) => {
          setDeleteId(row.id);
          setIsOpenConfirm(true);
        },
      },
    }),
    [communityId, navigate]
  );

  /* ---------------- Bulk Actions ---------------- */
  const bulkActions: BulkAction<HomestayRow>[] = useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (rows) => {
          if (rows.length === 0) return;
          setSelectedRows(rows);
          setIsOpenBulkConfirm(true);
        },
      },
    ],
    []
  );

  // ================= Pagination Handlers =================
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // ================= Render =================
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb
        current={{
          label: "จัดการที่พัก",
          to: `/super/community/${communityId}/homestay/all`,
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">จัดการที่พัก</h1>

        {/* Search & Add Button */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => navigate(`/super/community/${communityId}/homestay/create`)}
              aria-label="เพิ่มที่พักใหม่"
            >
              <span>+ เพิ่มที่พัก</span>
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded">{errorMessage}</div>
      )}

      <DataTable<HomestayRow>
        data={filteredRows}
        getKey={(row) => String(row.id)}
        columns={columns}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage,
          totalPages,
          totalCount,
          limit: pageSize,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectedChange={setSelectedRows}
        isLoading={isLoading}
        theme="brand"
      />

      {/* Modal — Single Delete */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />

      {/* Modal — Bulk Delete */}
      <Modal
        open={isOpenBulkConfirm}
        title="ยืนยันการลบหลายรายการ"
        text={`คุณต้องการลบที่พักจำนวน ${selectedRows.length} รายการหรือไม่?`}
        onConfirm={handleBulkDelete}
        onCancel={handleCancelBulkDelete}
      />
    </div>
  );
}
