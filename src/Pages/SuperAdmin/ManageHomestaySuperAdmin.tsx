/**
 * จัดการที่พัก (Super Admin)
 * - แสดงตารางที่พักในชุมชน
 * - breadcrumb: จัดการชุมชน > [ชื่อชุมชน] > จัดการที่พัก
 * - ปุ่มย้อนกลับ → กลับไปหน้ารายละเอียดชุมชน
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

// Components
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { PencilIcon, TrashIcon } from "@/Components/Tables/Icon";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";

// Services
import { getHomestaysAll } from "@/Libs/HomestayService";
import { getCommunityById } from "@/Libs/CommunityService";

// Types
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";

// ประเภทข้อมูลแถวในตาราง
type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

// ประเภทข้อมูลที่รับจาก API
type HomestayFromApi = {
  id: number;
  name: string;
  facility: string | null;
  type: string | null;
};

// ================= Utility =================
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

// ================= Component =================
export default function ManageHomestaySuperAdmin() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // ====== State ======
  const [communityName, setCommunityName] = useState<string>("");
  const [rows, setRows] = useState<HomestayRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ====== โหลดชื่อชุมชน ======
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) return;
        const res = await getCommunityById(Number(communityId));
        setCommunityName(res.data?.data?.name || "-");
      } catch (e) {
        console.error(e);
      }
    }
    fetchCommunity();
  }, [communityId]);

  // ====== โหลดข้อมูล Homestay ======
  const reload = useCallback(async () => {
    if (!communityId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHomestaysAll(Number(communityId), currentPage, pageSize);
      const payload = res.data?.data;
      const list: HomestayFromApi[] = Array.isArray(payload?.data) ? payload.data : [];
      const pg = payload?.pagination ?? {};

      const mapped: HomestayRow[] = list.map((h) => ({
        id: h.id,
        name: h.name ?? "-",
        facility: h.facility ?? "-",
        type: h.type ?? "-",
      }));

      setRows(mapped);
      setTotalItems(pg?.totalCount ?? mapped.length);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [communityId, currentPage, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ====== คอลัมน์ตาราง ======
  const columns: Column<HomestayRow>[] = [
    {
      key: "name",
      header: "ชื่อที่พัก",
      className: "min-w-[200px]",
      render: (row) => (
        <span className="text-dark-green font-medium">{row.name}</span>
      ),
    },
    { key: "facility", header: "สิ่งอำนวยความสะดวก" },
    { key: "type", header: "ประเภท" },
  ];

  // ====== Actions ต่อแถว ======
  const rowActions: DataTableActionsConfig<HomestayRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    className: "pr-6", // ใช้ Tailwind เว้นขอบขวา 
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/super/community/${communityId}/homestay/edit/${row.id}`),
      delete: (row) => {
        setDeleteId(row.id);
        setOpenConfirm(true);
      },
    },
  };

  // ====== ฟังก์ชันลบ ======
  const handleDelete = async (homestayId: number) => {
    console.log("ลบ homestay:", homestayId);
    // TODO: เขียน endpoint ลบ homestay ในอนาคต
  };

  // ====== กรองข้อมูล ======
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) =>
      [row.name, row.facility, row.type].some((v) => normalizeText(v).includes(q))
    );
  }, [rows, searchQuery]);

  // ================= Render =================
  return (
    <div className="space-y-4">
     {/* Breadcrumb */}
<div className="px-6 pt-2 pb-1">
  <nav aria-label="breadcrumb" className="flex items-center text-gray-700 text-sm">
    <Link
      to="/super/communities"
      className="text-gray-800 hover:text-dark-green font-medium"
    >
      จัดการชุมชน
    </Link>
    <Icon icon="mdi:chevron-right" className="mx-2 text-gray-400 w-3.5 h-3.5" />
    <Link
      to={`/super/community/detail/${communityId}`}
      className="text-gray-800 hover:text-dark-green font-medium"
    >
      {communityName || "ชุมชน"}
    </Link>
    <Icon icon="mdi:chevron-right" className="mx-2 text-gray-400 w-3.5 h-3.5" />
    <span className="text-gray-500 font-medium">จัดการที่พัก</span>
  </nav>
</div>

{/* <-- หัวข้อ */}
<div className="px-6 py-1 flex items-center justify-between">
  <Link
    to={`/super/community/detail/${communityId}`}
    className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
  >
    <Icon icon="lucide:arrow-left" className="w-5 h-5" />
    <h2 className="text-xl font-semibold">จัดการที่พัก</h2>
  </Link>
</div>

{/* Toolbar: Search + Add */}
<div className="px-6 pb-2">
  <div className="flex items-center gap-3">
    <div className="max-w-md">
      <SearchBarTable
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        // placeholder="ค้นหาชื่อที่พัก..."
      />
    </div>

    <div className="ml-auto">
      <Button
        onClick={() =>
          navigate(`/super/community/${communityId}/homestay/create`)
        }
        aria-label="เพิ่มที่พักใหม่"
      >
        <span>+ เพิ่มที่พัก</span>
      </Button>
    </div>
  </div>
</div>



      {/* Table */}
      <div className="px-6 pb-10">
        {errorMessage && (
          <div className="text-sm text-red-600 mb-2">{errorMessage}</div>
        )}
        <DataTable<HomestayRow>
          data={filteredRows}
          columns={columns}
          getKey={(row) => String(row.id)}
          actions={rowActions}
          selectable
          pagination={{
            currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalCount: totalItems,
            limit: pageSize,
          }}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => setPageSize(size)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal ยืนยันการลบ <-- เดี๋ยวหญิงเอามาใส่ */}
      <Modal
        open={openConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={async () => {
          if (deleteId == null) return;
          try {
            await handleDelete(deleteId);
            await reload();
          } catch (error: any) {
            console.error(error);
            alert(
              `ลบไม่สำเร็จ: ${
                error?.response?.data?.message ??
                error?.message ??
                "unknown error"
              }`
            );
          } finally {
            setOpenConfirm(false);
            setDeleteId(null);
          }
        }}
        onCancel={() => {
          setOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
