/**
 * จัดการร้านค้า (Super Admin)
 * - แสดงรายการร้านค้าทั้งหมดในชุมชน
 * - สามารถค้นหา เพิ่ม แก้ไข ลบ ร้านค้าได้
 * - ใช้งานร่วมกับ Modal ยืนยันและฟอร์มเพิ่ม/แก้ไข
 */

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// component
import Button from "@/Components/Button";
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { Modal } from "@/Components/Modal/Modal";
import { Icon } from "@iconify/react";
import { TrashIcon } from "@/Components/Tables/Icon";

// service
import { getAllStore } from "@/Services/store-service";
import { getCommunityById } from "@/Services/community-service";

// Types
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
  Pagination,
} from "@/Components/Tables/Types";

// Type ของตาราง
type StoreRow = {
  id: number;
  name: string;
  detail: string;
  tagStores: string;
};

//Type ของข้อมูลร้านค้า
type StoreFromApi = {
  id: number;
  name: string;
  detail: string | null;
  tagStores: {
    tag: {
      id: number;
      name: string;
    };
  }[];
};

const normalizeText = (s: string) =>
  (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

// ตารางจัดการร้านค้า
const columns: Column<StoreRow>[] = [
  {
    key: "name",
    header: "ชื่อร้านค้า",
    className: "min-w-[200px]",
  },
  { key: "detail", header: "รายละเอียด" },
  { key: "tagStores", header: "ประเภท" },
];

export default function ManageStores() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // state
  const [communityName, setCommunityName] = useState<string>("");
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<StoreRow[]>([]);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //ดึงชื่อชุมชน
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

  //โหลดข้อมูลร้านค้า
  const loadStores = async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const currentPage = pagination?.currentPage ?? 1;
      const limit = pagination?.limit ?? 10;

      const response = await getAllStore(Number(communityId), currentPage, limit);

      const resultData: StoreFromApi[] = response?.data?.data?.data ?? [];
      const resultPagination: Pagination =
        response?.data?.data?.pagination ?? pagination;


      // แปลงข้อมูลให้เข้ากับตาราง
      const mapped: StoreRow[] = resultData.map((store) => {
        const tagNames =
          store.tagStores?.map((t) => t.tag?.name).filter(Boolean) ?? [];
        return {
          id: store.id,
          name: store.name ?? "-",
          detail: store.detail ?? "-",
          tagStores: tagNames.join(", ") || "-",
        };
      });

      setRows(mapped);
      setPagination(resultPagination);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };


  React.useEffect(() => {
    loadStores();
  }, [Number(communityId), pagination.currentPage, pagination.limit]);

  //action แต่ละแถว ลบ แก้ไข
  const rowActions: DataTableActionsConfig<StoreRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/super/community/${communityId}/store/${row.id}/edit`),
      delete: (row) => {
        setDeleteId(row.id);
        setIsOpenConfirm(true);
      },
    },
  };

  //กรองข้อมูลที่แสดง
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.detail, row.tagStores].map((v) =>
        normalizeText(String(v ?? ""))
      );
      const passSearch = !q || haystacks.some((h) => h.includes(q));
      return passSearch;
    });
  }, [rows, searchQuery]);

  const handleDelete = (storeId: number) => {
    console.log("ลบ store : ", storeId);
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


  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="px-6 pb-1">
        <nav aria-label="breadcrumb" className="flex items-center text-gray-700 text-sm">
          <Link to="/super/communities" className="text-gray-800 hover:text-dark-green font-medium">
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
          <span className="text-gray-500 font-medium">จัดการร้านค้า</span>
        </nav>
      </div>

      {/* <-- หัวข้อ */}
      <div className="px-6 py-1 flex items-center justify-between">
        <Link
          to={`/super/community/detail/${communityId}`}
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h2 className="text-xl font-semibold">จัดการร้านค้า</h2>
        </Link>
      </div>

      {/* Toolbar: Search + Add */}
      <div className="px-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="ml-auto">
            <Button
              onClick={() => navigate(`/super/community/${communityId}/store/create`)}
              aria-label="เพิ่มร้านค้า"
            >
              <span>+ เพิ่มร้านค้า</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="px-6 pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        {/* Table */}
        <DataTable<StoreRow>
          data={filteredRows}
          getKey={(row) => row.id.toString()}
          columns={columns}
          selectable={true}
          pageSizeOptions={[10, 30, 50]}
          onPageChange={(p) => {
            setPagination((prev) => ({ ...prev, currentPage: p }));
          }}
          onPageSizeChange={(p) => {
            setPagination((prev) => ({
              ...prev,
              currentPage: 1,
              limit: p,
            }));
          }}
          onSelectedChange={(rows) => {
            console.log("rows", rows);
            setSelectedRows(rows);
          }}
          pagination={pagination}
          isLoading={isLoading}
          actions={rowActions}
          bulkActions={bulkActions}
        />
      </div>

      {/* Modal ยืนยันการลบ */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบที่พัก"
        text="คุณต้องการลบที่พักนี้หรือไม่?"
        onConfirm={async () => {
          if (deleteId == null) return;
          try {
            await handleDelete(deleteId);
            await loadStores();
          } catch (error: any) {
            console.error(error);
            alert(
              `ลบไม่สำเร็จ: ${error?.response?.data?.message ??
              error?.message ??
              "unknown error"
              }`
            );
          } finally {
            setIsOpenConfirm(false);
            setDeleteId(null);
          }
        }}
        onCancel={() => {
          setIsOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
