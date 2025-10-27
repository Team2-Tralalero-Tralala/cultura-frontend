import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import Button from "@/Components/Button";
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";

// Services
import { getAllStoreAdmin } from "@/Services/store-service";

// Types
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";

type StoreRow = {
  id: number;
  name: string;
  detail: string;
  tagStores: string;
};

type StoreFromApi = {
  id: number;
  name: string;
  detail: string | null;
  tagStores: { tag: { id: number; name: string } }[];
};

const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

const columns: Column<StoreRow>[] = [
  { key: "name", header: "ชื่อร้านค้า", className: "min-w-[200px]" },
  { key: "detail", header: "รายละเอียด" },
  { key: "tagStores", header: "ประเภท" },
];

export default function ManageStoreAdmin() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  // State
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // โหลดข้อมูลร้านค้า
  const loadStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getAllStoreAdmin(currentPage, pageSize);
      const payload = res.data?.data;
      const list: StoreFromApi[] = Array.isArray(payload?.data) ? payload.data : [];
      const pg = payload?.pagination ?? {};

      const mapped: StoreRow[] = list.map((store) => {
        const tagNames = store.tagStores?.map((t) => t.tag?.name).filter(Boolean) ?? [];
        return {
          id: store.id,
          name: store.name ?? "-",
          detail: store.detail ?? "-",
          tagStores: tagNames.join(", ") || "-",
        };
      });

      setRows(mapped);
      setTotalItems(pg?.totalCount ?? mapped.length);
    } catch (e: any) {
      console.error("โหลดข้อมูลร้านค้าไม่สำเร็จ", e);
      setErrorMessage(e.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // Actions ของแต่ละแถว
  const rowActions: DataTableActionsConfig<StoreRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/admin/community/store/edit/${storeId}/${row.id}`),
      delete: (row) => {
        setDeleteId(row.id);
        setOpenConfirm(true);
      },
    },
  };

  // ค้นหา
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.detail, row.tagStores].map((v) =>
        normalizeText(String(v ?? ""))
      );
      return !q || haystacks.some((h) => h.includes(q));
    });
  }, [rows, searchQuery]);

  const handleDelete = async (storeId: number) => {
    console.log("ลบ store:", storeId);
  };

  const bulkActions: BulkAction<StoreFromApi>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const ids = rows.map((r) => r.id);
        alert("bulk delete: " + ids);
        await loadStores();
      },
    },
  ];

  // คำนวณ start/end ของ pagination
const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
const endItem = Math.min(currentPage * pageSize, totalItems);

// pagination object
const pagination = {
  currentPage: startItem,  // ตำแหน่งของข้อมูลแรก
  totalPages: endItem,     // ตำแหน่งของข้อมูลสุดท้าย
  totalCount: totalItems,  // จำนวนทั้งหมด
  limit: pageSize,
};



  return (
    <div className="space-y-4">
      <div className="px-6 pb-1">
        <nav aria-label="breadcrumb" className="flex items-center text-gray-700 text-sm">
          <span className="text-gray-800 font-medium">จัดการร้านค้า</span>
        </nav>
      </div>

      <div className="px-6 py-1 flex items-center justify-between">
        <h2 className="text-xl font-semibold"> จัดการร้านค้า </h2>
        <Button onClick={() => navigate("/admin/store/create")} aria-label="เพิ่มร้านค้า">
          + เพิ่มร้านค้า
        </Button>
      </div>

      <div className="px-6 pb-2">
        <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="px-6 pb-2 text-sm text-gray-500">
        แสดง {startItem}-{endItem} จาก {totalItems} รายการ
      </div>

      <div className="px-6 pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        <DataTable<StoreRow>
          data={filteredRows}
          columns={columns}
          getKey={(row) => String(row.id)}
          actions={rowActions}
          bulkActions={bulkActions}
          selectable
          isLoading={isLoading}
          pageSizeOptions={[10, 30, 50]}
          pagination={pagination}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(limit) => {
            setPageSize(limit);
            setCurrentPage(1); // รีเซ็ตไปหน้า 1 เวลาเปลี่ยน page size
          }}
          theme="brand"
        />
      </div>

      <Modal
        open={openConfirm}
        title="ยืนยันการลบร้านค้า"
        text="คุณต้องการลบร้านค้านี้หรือไม่?"
        onConfirm={async () => {
          if (!deleteId) return;
          await handleDelete(deleteId);
          setOpenConfirm(false);
          setDeleteId(null);
          await loadStores();
        }}
        onCancel={() => {
          setOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
