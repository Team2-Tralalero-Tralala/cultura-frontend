/**
 * คำอธิบาย : Component หน้าแแสดงข้อมูลร้านค้าทั้งหมด ที่อยู่ในชุมชนของ Super Admin ที่มีปุ่มเพิ่ม ลบ แก้ไขร้านค้า
 * ใช้สำหรับดึงข้อมูลร้านค้าจาก backend เพื่อนำมาแสดงในตาราง
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { TrashIcon } from "@/Components/Tables/Icon";
import DataTable from "@/Components/Tables/Index";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { getCommunityById } from "@/Libs/CommunityService";
import { getAllStore } from "@/Libs/StoreService";

import type {
  BulkAction,
  Column,
  DataTableActionsConfig,
  Pagination,
} from "@/Components/Tables/Types";
import axios from "axios";

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
  tagStores: {
    tag: {
      id: number;
      name: string;
    };
  }[];
};

/**
 * คำอธิบาย: ฟังก์ชันสำหรับจัดรูปแบบข้อความให้เป็นตัวพิมพ์เล็ก และลบช่องว่างเกินออก
 * Input: str (ข้อความต้นฉบับ)
 * Output: ข้อความที่ผ่านการ normalize แล้ว
 */
const normalizeText = (str: string) =>
  (str ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * คำอธิบาย: กำหนดคอลัมน์ของตารางร้านค้า
 */
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

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดงหน้า Manage Store Super Admin
 * Input : ไม่มี
 * Output : ส่วนแสดงผลของหน้า Manage Store Super Admin
 */
export function ManageStorePage() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดข้อมูลชื่อชุมชน
   * Input: - (ใช้ communityId จาก params)
   * Output: อัปเดต state communityNames
   */
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

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดข้อมูลร้านค้า
   * Input: - (ใช้ communityId, pagination จาก state)
   */
  const loadStores = async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const page = pagination?.currentPage ?? 1;
      const limit = pagination?.limit ?? 10;

      const response = await getAllStore(Number(communityId), page, limit);

      const resultData: StoreFromApi[] = response?.data?.data?.data ?? [];
      const resultPagination: Pagination = response?.data?.data?.pagination ?? pagination;

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

  /*
   * คำอธิบาย : ฟังก์ชัน useEffect สำหรับโหลดข้อมูลร้านค้าเมื่อ communityId, currentPage หรือ limit เปลี่ยนแปลง
   * Input : communityId, pagination.currentPage, pagination.limit
   * Output : void
   */
  useEffect(() => {
    loadStores();
  }, [communityId, pagination.currentPage, pagination.limit]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับกำหนดการกระทำของแต่ละแถวในตารางร้านค้า
   * Input : ไม่มี
   * Output : การกำหนดค่าการกระทำของแต่ละแถว
   */
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
        setIsConfirmModalOpen(true);
      },
    },
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับกรองแถวร้านค้าตามข้อความค้นหา
   * Input : string
   * Output : string ที่ผ่านการ normalize แล้ว
   */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.detail, row.tagStores].map((value) =>
        normalizeText(String(value ?? "")),
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

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับกำหนดการกระทำแบบกลุ่ม (Bulk Actions) ในตารางร้านค้า
   * Input : ไม่มี
   * Output : รายการการกระทำแบบกลุ่ม
   */
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
        setIsConfirmModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <div>
          <Breadcrumb
            current={{
              label: "จัดการร้านค้า",
              to: `/super/community/${communityId}/stores/all`,
            }}
          />
        </div>
        <Link
          to={`/super/community/detail/${communityId}`}
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h1 className="text-xl font-bold">จัดการร้านค้า</h1>
        </Link>

        <div className="flex items-center justify-between w-full mt-2">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

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

      <Modal
        isOpen={isConfirmModalOpen}
        title="ยืนยันการลบร้านค้า"
        text={
          deleteIds?.length > 1
            ? `คุณต้องการลบร้านค้านี้ทั้งหมด ${deleteIds.length} รายการหรือไม่?`
            : "คุณต้องการลบร้านค้านี้หรือไม่?"
        }
        onConfirm={async () => {
          if (!deleteIds?.length) return;

          await Promise.all(deleteIds.map((id) => handleDelete(id)));

          setIsConfirmModalOpen(false);
          setDeleteIds([]);
          await loadStores();
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setDeleteIds([]);
        }}
      />
    </div>
  );
}
