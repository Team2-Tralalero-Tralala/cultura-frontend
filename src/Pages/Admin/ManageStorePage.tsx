/**
 * คำอธิบาย: Component หน้าแสดงข้อมูลร้านค้าทั้งหมด ที่อยู่ในชุมชนของ Admin ที่มีปุ่มเพิ่ม ลบ แก้ไขร้านค้า
 * ใช้สำหรับดึงข้อมูลร้านค้าจาก backend เพื่อนำมาแสดงในตาราง
 */
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/Components/Button";
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { getAllStoreAdmin } from "@/Libs/StoreService";
import { getCommunityDetailByAdmin } from "@/Libs/CommunityService";

import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
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
  tagStores: { tag: { id: number; name: string } }[];
};



/**
 * คำอธิบาย: ฟังก์ชันสำหรับกำหนดคอลัมน์ของตารางร้านค้า
 * Input: ไม่มี
 * Output: รายการคอลัมน์ของตาราง
 */
const columns: Column<StoreRow>[] = [
  {
    key: "name",
    header: "ชื่อร้านค้า",
    className: "min-w-[150px]",
    render: (row) => (
      <Link
        to={`/admin/community/store/${row.id}`}
        className="hover:text-dark-green hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  { key: "detail", header: "รายละเอียด" },
  { key: "tagStores", header: "ประเภท" },
];

/**
 * คำอธิบาย: Component สำหรับแสดงหน้าจัดการร้านค้า Admin
 * Input: -
 * Output: JSX.Element (หน้าจอแสดงตารางรายการร้านค้าและการจัดการ)
 */
export default function ManageStorePage() {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState<string>("");
  const [storeRows, setStoreRows] = useState<StoreRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<StoreRow[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number | number[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดข้อมูลร้านค้าจาก API
   * Input: ไม่มี
   * Output: อัปเดต state storeRows และ pagination
   */
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const currentPage = pagination?.currentPage ?? 1;
      const limit = pagination?.limit ?? 10;

      const response = await getAllStoreAdmin(currentPage, limit, searchQuery);

      const resultData: StoreFromApi[] = response?.data?.data?.data ?? [];
      const resultPagination: Pagination = response?.data?.data?.pagination ?? pagination;

      const mapped: StoreRow[] = resultData.map((store) => {
        const tagNames = store.tagStores?.map((tag) => tag.tag?.name).filter(Boolean) ?? [];
        return {
          id: store.id,
          name: store.name ?? "-",
          detail: store.detail ?? "-",
          tagStores: tagNames.join(", ") || "-",
        };
      });

      setStoreRows(mapped);
      setPagination(resultPagination);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดข้อมูลร้านค้าเมื่อ pagination มีการเปลี่ยนแปลง
   * Input: pagination.currentPage, pagination.limit, searchQuery
   * Output: เรียก fetchStores เพื่อโหลดข้อมูลใหม่
   */
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดชื่อชุมชนเมื่อคอมโพเนนต์ถูกสร้างขึ้น
   * Input: ไม่มี
   * Output: เรียก fetchCommunityName เพื่อโหลดชื่อชุมชน
   */
  React.useEffect(() => {
    fetchCommunityName();
  }, []);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับดึงชื่อชุมชนของ Admin
   * Input: ไม่มี
   * Output: อัปเดต state communityName
   */
  const fetchCommunityName = async () => {
    try {
      const res = await getCommunityDetailByAdmin();
      setCommunityName(res.data?.data?.name || "ชุมชน");
    } catch (error) {
      console.error("Failed to fetch community name:", error);
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับกำหนดการกระทำในแต่ละแถวของตาราง
   * Input: ไม่มี
   * Output: การกระทำที่สามารถทำได้ในแต่ละแถว
   */
  const rowActions: DataTableActionsConfig<StoreRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/admin/community/store/${row.id}/edit/`),
      delete: (row) => {
        setDeleteIds(row.id);
        setIsConfirmModalOpen(true);
      },
    },
  };



  /**
   * คำอธิบาย: ฟังก์ชันสำหรับลบร้านค้าตามรหัสร้านค้า
   * Input: storeId
   * Output: void
   */
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

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับลบหลายอันพร้อมกัน
   * Input: rows
   * Output: void
   */
  const bulkActions: BulkAction<StoreRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const storeId = rows.map((row) => row.id);
        setDeleteIds(storeId);
        setIsConfirmModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Breadcrumb
            current={{
              label: "จัดการร้านค้า",
              to: "/admin/community/stores",
            }}
          />
        </div>

        <h1 className="text-xl font-bold "> จัดการร้านค้า </h1>

        <div className="flex items-center justify-between w-full ">
          <div className="w-[260px]">
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>

          <div>
            <Button
              onClick={() => navigate("/admin/community/store/create")}
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
          data={storeRows}
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
          bulkActions={bulkActions as BulkAction<StoreRow>[]}
        />
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        title="ยืนยันการลบร้านค้า"
        text="คุณต้องการลบร้านค้านี้หรือไม่?"
        onConfirm={async () => {
          if (!deleteIds) return;
          if (Array.isArray(deleteIds)) {
            await Promise.all(deleteIds.map((id) => handleDelete(id)));
          } else {
            await handleDelete(deleteIds);
          }
          setIsConfirmModalOpen(false);
          setDeleteIds(null);
          await fetchStores();
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setDeleteIds(null);
        }}
      />
    </div>
  );
}
