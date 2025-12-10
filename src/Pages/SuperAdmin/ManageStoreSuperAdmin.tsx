/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * จัดการร้านค้า (Super Admin)
 * - แสดงรายการร้านค้าทั้งหมดในชุมชน
 * - สามารถค้นหา เพิ่ม แก้ไข ลบ ร้านค้าได้
 * - ใช้งานร่วมกับ Modal ยืนยันและฟอร์มเพิ่ม/แก้ไข
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

// component
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { TrashIcon } from "@/Components/Tables/Icon";
import DataTable from "@/Components/Tables/Index";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

// service
import { getCommunityById } from "@/Services/community-service";
import { getAllStore } from "@/Services/store-service";

// Types
import type {
  BulkAction,
  Column,
  DataTableActionsConfig,
  Pagination,
} from "@/Components/Tables/Types";
import axios from "axios";

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

const normalizeText = (str: string) =>
  (str ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

// ตารางจัดการร้านค้า
const columns: Column<StoreRow>[] = [
  {
    key: "name",
    header: "ชื่อร้านค้า",
    className: "min-w-[200px]",
    render: (row) => (
      <Link to={`/super/store/${row.id}`} className="hover:text-dark-green hover:underline">
        {row.name}
      </Link>
    ),
  },
  { key: "detail", header: "รายละเอียด" },
  { key: "tagStores", header: "ประเภท" },
];

export default function ManageStores() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  //ดึงชื่อชุมชน
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) return;
        const res = await getCommunityById(Number(communityId));
        setCommunityName(res.data?.data?.name || "-");
      } catch (error) {
        console.error(error);
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
      const resultPagination: Pagination = response?.data?.data?.pagination ?? pagination;

      // แปลงข้อมูลให้เข้ากับตาราง
      const mapped: StoreRow[] = resultData.map((store) => {
        const tagNames =
          store.tagStores?.map((tagStore) => tagStore.tag?.name).filter(Boolean) ?? [];
        return {
          id: store.id,
          name: store.name ?? "-",
          detail: store.detail ?? "-",
          tagStores: tagNames.join(", ") || "-",
        };
      });

      setRows(mapped);
      setPagination(resultPagination);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
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
        setDeleteIds([row.id]);
        setIsOpenConfirm(true);
      },
    },
  };

  //กรองข้อมูลที่แสดง
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.detail, row.tagStores].map((value) =>
        normalizeText(String(value ?? ""))
      );
      const passSearch = !query || haystacks.some((haystack) => haystack.includes(query));
      return passSearch;
    });
  }, [rows, searchQuery]);

  const handleDelete = async (storeId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/shared/store/${storeId}/delete`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Failed to delete store:", error);
      setErrorMessage("ลบร้านค้าไม่สำเร็จ");
    }
  };

  const bulkActions: BulkAction<StoreRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const storeIds = rows.map((row) => row.id);
        setDeleteIds(storeIds);
        setIsOpenConfirm(true);
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col gap-2 w-full">
        {/* Breadcrumb */}
        <div>
          <Breadcrumb
            current={{
              label: "จัดการร้านค้า",
              to: `/super/community/${communityId}/stores/all`,
            }}
          />
        </div>

        {/* <-- หัวข้อ */}
        <Link
          to={`/super/community/detail/${communityId}`}
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h1 className="text-xl font-bold">จัดการร้านค้า</h1>
        </Link>

        <div className="flex items-center justify-between w-full mt-2">
          {/* Section: Search */}
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {/* Section: Add Store */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/super/community/${communityId}/store/create`)}
              aria-label="เพิ่มร้านค้า"
            >
              <span className="text-lg leading-none">＋</span>
              <span>เพิ่มร้านค้า</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        {/* Table */}
        <DataTable<StoreRow>
          data={filteredRows}
          getKey={(row) => row.id.toString()}
          columns={columns}
          selectable={true}
          pageSizeOptions={[10, 30, 50]}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
          }}
          onPageSizeChange={(pageSize) => {
            setPagination((prev) => ({
              ...prev,
              currentPage: 1,
              limit: pageSize,
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

      {/* Modal สำหรับยืนยันการลบร้านค้า */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบร้านค้า"
        text={
          deleteIds?.length > 1
            ? `คุณต้องการลบร้านค้านี้ทั้งหมด ${deleteIds.length} รายการหรือไม่?`
            : "คุณต้องการลบร้านค้านี้หรือไม่?"
        }
        onConfirm={async () => {
          if (!deleteIds?.length) return;

          // ลบทุก id (กรณีเดี่ยวก็มีแค่ 1)
          await Promise.all(deleteIds.map((id) => handleDelete(id)));

          setIsOpenConfirm(false);
          setDeleteIds([]);
          await loadStores();
        }}
        onCancel={() => {
          setIsOpenConfirm(false);
          setDeleteIds([]);
        }}
      />
    </div>
  );
}
