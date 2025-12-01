/*
 * หน้า: จัดการที่พัก (Super Admin)
 * คำอธิบาย :
 *   - แสดงตารางรายการที่พักในชุมชน
 *   - breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
 *   - ปุ่มย้อนกลับไปหน้ารายละเอียดชุมชน
 *   - รองรับค้นหา / เลือกหลายแถว / ลบหลายรายการ
 * Role: SuperAdmin เท่านั้น
 */

// import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ===========================================================
   Components
   =========================================================== */
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import { Modal } from "@/Components/Modal/Modal";
import Button from "@/Components/Button";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { TrashIcon } from "@/Components/Tables/Icon";
import React, { useEffect, useState, useCallback, useMemo } from "react";


/* ===========================================================
   Services
   =========================================================== */
import { getHomestaysAll } from "@/Services/homestay-services";
import { getCommunityById } from "@/Services/community-service";

/* ===========================================================
   Types
   =========================================================== */
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
  Pagination,
} from "@/Components/Tables/Types";

/* ===========================================================
   Types ภายในหน้า
   =========================================================== */
type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

/* ===========================================================
   Component หลัก
   =========================================================== */
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState<string>("-");
  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedRows, setSelectedRows] = useState<HomestayRow[]>([]);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /* ---------------------- โหลดชื่อชุมชน ---------------------- */
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

  // ===== utils ค้นหา =====
  const normalizeText = (s: string) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

  // ===== กรองข้อมูลตามคำค้นหา =====
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.facility, r.type].some((v) => normalizeText(v).includes(q))
    );
  }, [rows, searchQuery]);


  /* ---------------------- โหลดข้อมูลที่พัก ---------------------- */
  const fetchData = useCallback(async () => {
    if (!communityId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // ✅ เพิ่ม page, limit
      const { data } = await getHomestaysAll(Number(communityId), currentPage, pageSize);
      const payload = data?.data;

      const list = Array.isArray(payload?.data) ? payload.data : [];
      const homestays: HomestayRow[] = list.map((h: any) => ({
        id: h.id,
        name: h.name ?? "-",
        facility: h.facility ?? "-",
        type: h.type ?? "-",
      }));

      setRows(homestays);
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
  }, [fetchData, currentPage, pageSize]);

  /* ---------------------- คอลัมน์ตาราง ---------------------- */
  const columns: Column<HomestayRow>[] = [
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
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภทห้อง" },
  ];

  /* ---------------------- Action ต่อแถว ---------------------- */
  const rowActions: DataTableActionsConfig<HomestayRow> = {
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
  };

  /* ---------------------- Bulk Action ---------------------- */
  const bulkActions: BulkAction<HomestayRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "danger",
      confirm: (rows) => `ยืนยันลบที่พักจำนวน ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const ids = rows.map((r) => r.id);
        alert("ลบทั้งหมด: " + ids.join(", "));
        await fetchData();
      },
    },
  ];

  /* ---------------------- Modal ยืนยันการลบ ---------------------- */
  const handleDelete = async () => {
    if (!deleteId) return;
    alert("ลบที่พัก ID: " + deleteId);
    setIsOpenConfirm(false);
    setDeleteId(null);
    await fetchData();
  };

  /* ===========================================================
     ส่วนแสดงผล (Render)
     =========================================================== */
  return (
    <div className="space-y-4">
      {/* ===== Breadcrumb ===== */}
      <div>
                <Breadcrumb
          current={{
            label: "จัดการที่พัก",
            to: `/super/community/${communityId}/homestay/all`,
            fromSidebar: true,
          }}
        />
      </div>

      {/* ===== ส่วนหัว + Search ===== */}
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">จัดการที่พัก</h1>
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // ใช้ state ตัวใหม่แทน pagination
              }}
            />

          </div>
          <div className="ml-auto">
            <Button
              onClick={() => navigate(`/super/community/${communityId}/homestay/create`)}

            >
              <span>+ เพิ่มที่พัก</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===== แสดงข้อความ error ===== */}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* ===== DataTable ===== */}
      <DataTable<HomestayRow>
        data={filteredRows}
        getKey={(row) => String(row.id)}
        columns={columns}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage,
          totalPages,
          totalCount,
          limit: pageSize,
        }}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        onSelectedChange={(rows) => setSelectedRows(rows)}
        isLoading={isLoading}
        actions={rowActions}
        bulkActions={bulkActions}
        theme="brand"
      />


      {/* ===== Modal ยืนยันลบ ===== */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={handleDelete}
        onCancel={() => setIsOpenConfirm(false)}
      />
    </div>
  );
}
