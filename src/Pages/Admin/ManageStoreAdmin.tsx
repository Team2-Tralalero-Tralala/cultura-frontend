/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * คำอธิบาย : หน้าแแสดงข้อมูลร้านค้าทั้งหมด ที่อยู่ในชุมชนของ Admin ที่มีปุ่มเพิ่ม ลบ แก้ไขร้านค้า
 * ใช้สำหรับดึงข้อมูลร้านค้าจาก backend เพื่อนำมาแสดงในตาราง
 */
import React, {  useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// Components
import Button from "@/Components/Button";
import DataTable from "@/Components/Tables/Index";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

// Services
import { getAllStoreAdmin } from "@/Services/store-service";
import { getCommunityDetailByAdmin } from "@/Services/community-service";

// Types
import type { Column, DataTableActionsConfig, BulkAction, Pagination } from "@/Components/Tables/Types";
import axios from "axios";

// ประเภทข้อมูลร้านค้าในตาราง
type StoreRow = {
  id: number;
  name: string;
  detail: string;
  tagStores: string;
};

// ประเภทข้อมูลร้านค้าที่ได้รับจาก API
type StoreFromApi = {
  id: number;
  name: string;
  detail: string | null;
  tagStores: { tag: { id: number; name: string } }[];
};

const normalizeText = (str: string) =>
  (str ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

// กำหนดคอลัมน์ของตาราง
const columns: Column<StoreRow>[] = [
  {
    key: "name",
    header: "ชื่อร้านค้า",
    className: "min-w-[200px]",
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

export default function ManageStoreAdmin() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  // State
  const [communityName, setCommunityName] = useState<string>("");
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const API_BASE_URL = import.meta.env.VITE_API_URL;


  /*
* คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลร้านค้าจาก API
*/
  const loadStores = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const currentPage = pagination?.currentPage ?? 1;
      const limit = pagination?.limit ?? 10;

      const response = await getAllStoreAdmin(currentPage, limit);

      const resultData: StoreFromApi[] = response?.data?.data?.data ?? [];
      const resultPagination: Pagination =
        response?.data?.data?.pagination ?? pagination;


      // แปลงข้อมูลให้เข้ากับตาราง
      const mapped: StoreRow[] = resultData.map((store) => {
        const tagNames =
          store.tagStores?.map((tag) => tag.tag?.name).filter(Boolean) ?? [];
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
  }, [pagination.currentPage, pagination.limit]);

  React.useEffect(() => {
    fetchCommunityName();
  }, []);

  const fetchCommunityName = async () => {
    try {
      const res = await getCommunityDetailByAdmin();
      setCommunityName(res.data?.data?.name || "ชุมชน");
    } catch (error) {
      console.error("Failed to fetch community name:", error);
    }
  };

  // Actions ของแต่ละแถว
  const rowActions: DataTableActionsConfig<StoreRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/admin/community/store/${row.id}/edit/`),
      delete: (row) => {
        setDeleteId(row.id);
        setIsOpenConfirm(true);
      },
    },
  };

  /*
  * คำอธิบาย : ฟังก์ชันสำหรับกรองข้อมูลร้านค้าตามคำค้นหา
  * Input : searchQuery
  * Output : รายการร้านค้าที่ผ่านการกรอง
  */
  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.detail, row.tagStores].map((value) =>
        normalizeText(String(value ?? ""))
      );
      return !query || haystacks.some((haystack) => haystack.includes(query));
    });
  }, [rows, searchQuery]);

  /*
  * คำอธิบาย : ฟังก์ชันสำหรับลบร้านค้าตามรหัสร้านค้า
  * Input : storeID
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

  /*
  * คำอธิบาย : ฟังก์ชันสำหรับลบหลายอันพร้อมกัน
  * Input : rows
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
        alert("bulk delete: " + storeIds);
        await loadStores();
      },
    },
  ];

  /*
   * คำอธิบาย : ฟังก์ชันหลักของหน้า manage store admin
   */
  return (
    <div className="space-y-4">
      {/* Section: Header */}
      <div className="flex flex-col gap-2 w-full">
        {/* Breadcrumb */}
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
          {/* Section: Search */}
          <div className="w-[260px]">
            <SearchBarTable value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>

          {/* Section: Add Store */}
          <div>
            <Button onClick={() => navigate("/admin/community/store/create")} aria-label="เพิ่มร้านค้า">
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
          bulkActions={bulkActions as BulkAction<StoreRow>[]}
        />
      </div>

      {/* Modal สำหรับยืนยันการลบร้านค้า */}
      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบร้านค้า"
        text="คุณต้องการลบร้านค้านี้หรือไม่?"
        onConfirm={async () => {
          if (!deleteId) return;
          await handleDelete(deleteId);
          setIsOpenConfirm(false);
          setDeleteId(null);
          await loadStores();
        }}
        onCancel={() => {
          setIsOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
