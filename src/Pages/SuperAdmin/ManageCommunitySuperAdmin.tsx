/**
 * คำอธิบาย : Component สำหรับแสดงหน้าจัดการชุมชน (Super Admin)
 * หน้าที่ : ดึงข้อมูลชุมชน แสดงในตาราง พร้อมตัวกรอง ค้นหา และปุ่มเพิ่ม/แก้ไข/ลบ
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable from "@/Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";
import { TrashIcon } from "@/Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import type { CommunityRow, CommunityDtoFromApi } from "@/Types/Community";
import { getCommunities, deleteCommunity } from "@/Services/community-service";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/*
 * คำอธิบาย : Custom Hook สำหรับชะลอการอัปเดตค่า (Debounce) ช่วยลดการเรียก API ถี่เกินไปในขณะที่ค่า value เปลี่ยนแปลงต่อเนื่อง (เช่น การพิมพ์ค้นหา)
 * Input :
 * - value (T) : ค่าที่ต้องการหน่วงเวลา
 * - delay (number) : ระยะเวลาที่ต้องการหน่วง (หน่วย milliseconds)
 * Output : ค่าล่าสุดที่ผ่านการหน่วงเวลาแล้ว (Debounced Value)
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type StatusFilter = "all" | "open" | "closed";

const columns: Column<CommunityRow>[] = [
  {
    key: "name",
    header: "ชื่อชุมชน",
    className: "min-w-[240px]",
    render: (row) => (
      <Link
        to={`/super/community/${row.id}`}
        className="text-dark-green hover:underline font-medium inline-block max-w-full truncate"
        onClick={(event) => event.stopPropagation()}
      >
        {row.name}
      </Link>
    ),
  },
  { key: "province", header: "จังหวัด" },
  {
    key: "status",
    header: "สถานะ",
    render: (row) => (String(row.status).toUpperCase() === "OPEN" ? "เปิด" : "ปิด"),
  },
  { key: "admin", header: "ผู้ดูแล" },
];

export default function ManageCommunitySuperAdmin() {
  const navigate = useNavigate();

  const [communityRows, setCommunityRows] = useState<CommunityRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = React.useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // สร้างตัวแปร search ที่ผ่านการหน่วงเวลาแล้ว (500ms)
  const debouncedSearch = useDebounce(searchQuery, 500);

  const statusOptions = useMemo(
    () =>
      [
        { label: "ทั้งหมด", value: "all" },
        { label: "เปิด", value: "open" },
        { label: "ปิด", value: "closed" },
      ] as const,
    []
  );

  /*
   * คำอธิบาย : ฟังก์ชันโหลดข้อมูลจาก API
   * Input : currentPage, pageSize
   * Output : เซตข้อมูลชุมชนลง state communityRows
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getCommunities(
        currentPage,
        pageSize,
        debouncedSearch,
        statusFilter
      );

      const communityPayload = response.data?.data;

      const communityLists: CommunityDtoFromApi[] = Array.isArray(communityPayload?.data)
        ? communityPayload.data
        : [];

      const paginationData = communityPayload?.pagination ?? {};

      const mappedCommunities: CommunityRow[] = communityLists.map((community) => ({
        id: community.id,
        name: community.name ?? "-",
        province: community.location?.province ?? "-",
        status: community.status ?? "CLOSED",
        admin: community.admin
          ? `${community.admin.fname ?? ""} ${community.admin.lname ?? ""}`.trim()
          : "-",
      }));

      setCommunityRows(mappedCommunities);
      setTotalItems(paginationData?.totalCount ?? 0);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  // เมื่อ Search หรือ Filter เปลี่ยน ให้รีเซ็ตกลับไปหน้า 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลชุมชนตาม ID
   * Input : communityId (number)
   * Output : ไม่มี (เรียก API ลบข้อมูล)
   */
  const handleDelete = useCallback(async (communityId: number) => {
    await deleteCommunity(Number(communityId));
  }, []);

  /*
   * คำอธิบาย : ฟังก์ชันยืนยันการลบข้อมูล (ทั้งแบบเดี่ยวและแบบกลุ่ม)
   * Input : deleteId, bulkDeleteIds
   * Output : รีโหลดข้อมูลใหม่และปิด Modal
   */
  const handleConfirmDelete = useCallback(async () => {
    try {
      if (deleteId !== null) {
        await handleDelete(deleteId);
      } else if (bulkDeleteIds.length > 0) {
        await Promise.all(bulkDeleteIds.map((id) => handleDelete(id)));
      }
      await reload();
    } catch (error) {
      console.error(error);
      alert("ลบไม่สำเร็จ");
    } finally {
      setIsOpenConfirm(false);
      setDeleteId(null);
      setBulkDeleteIds([]);
    }
  }, [deleteId, bulkDeleteIds, handleDelete, reload]);

  /*
   * คำอธิบาย : ฟังก์ชันยกเลิกการลบและล้างค่าสถานะการลบ
   * Input : ไม่มี
   * Output : ปิด Modal และล้างค่า deleteId, bulkDeleteIds
   */
  const handleCancelDelete = useCallback(() => {
    setIsOpenConfirm(false);
    setDeleteId(null);
    setBulkDeleteIds([]);
  }, []);

  const bulkActions: BulkAction<CommunityRow>[] = useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (selectedRows) => {
          const ids = selectedRows.map((row) => row.id);
          setBulkDeleteIds(ids);
          setConfirmMessage(`คุณต้องการลบชุมชนจำนวน ${ids.length} รายการหรือไม่`);
          setIsOpenConfirm(true);
        },
      },
    ],
    []
  );

  const rowActions: DataTableActionsConfig<CommunityRow> = {
    header: "จัดการ",
    align: "right",
    width: "120px",
    variant: "icons",
    className: "pr-6",
    items: () => ["edit", "delete"],
    callbacks: {
      edit: (row) => navigate(`/super/community/${row.id}/edit`),
      delete: (row) => {
        setDeleteId(Number(row.id));
        setConfirmMessage("คุณต้องการยืนยันการลบชุมชนหรือไม่");
        setIsOpenConfirm(true);
      },
    },
  };

  return (
    <div className="space-y-4 cursor-default">
      <div>
        <Breadcrumb
          current={{
            label: "จัดการชุมชน",
            to: "/super/communities",
            fromSidebar: true,
          }}
        />
      </div>

      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">จัดการชุมชน</h1>
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <FilterDropdown
            options={statusOptions as unknown as { label: string; value: string }[]}
            selected={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
          />
          <div className="ml-auto">
            <Button onClick={() => navigate("/super/community/create")} aria-label="เพิ่มชุมชนใหม่">
              <span>+ เพิ่มชุมชน</span>
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<CommunityRow>
        data={communityRows}
        columns={columns}
        getKey={(row) => String(row.id)}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / pageSize), // คำนวณจาก Total Count จริง
          totalCount: totalItems,
          limit: pageSize,
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => setPageSize(size)}
        isLoading={isLoading}
        theme="brand"
      />

      <Modal
        open={isOpenConfirm}
        title="ยืนยันการลบชุมชน"
        text={confirmMessage}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
