/*
 * คำอธิบาย : Component สำหรับแสดงรายการชุมชนทั้งหมด (Super Admin)
 * หน้าที่ : ใช้สำหรับแสดงตารางชุมชน พร้อมฟังก์ชันค้นหา กรองสถานะ เพิ่ม ลบ แก้ไขข้อมูล
 * Input : ไม่มี (ดึงข้อมูลจาก API โดยตรง)
 * Output : ตารางรายชื่อชุมชนพร้อม Pagination, Filter, Search และปุ่มจัดการ
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// ================= Import Section =================
// จัดกลุ่ม import: UI Components -> Types -> Libs
import DataTable from "@/Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";
import { TrashIcon } from "@/Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import type { CommunityRow } from "@/Types/Community";
import { getCommunities, deleteCommunity } from "@/Services/community-service";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

// ================= Utility =================
/*
 * คำอธิบาย : ฟังก์ชันแปลงข้อความให้เป็นตัวพิมพ์เล็ก ลบช่องว่างเกิน และ normalize สำหรับค้นหา
 * Input : s (string)
 * Output : string ที่ถูก normalize แล้ว
 */
const normalizeText = (s: string) =>
  (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

// ================= Types =================
/*
 * คำอธิบาย : โครงสร้างข้อมูลชุมชนที่ได้รับจาก API
 */
type ApiCommunity = {
  id: number;
  name?: string | null;
  status?: "OPEN" | "CLOSED" | string | null;
  location?: { province?: string | null } | null;
  admin?: { fname?: string | null; lname?: string | null } | null;
};

/*
 * คำอธิบาย : ชนิดข้อมูลสำหรับตัวกรองสถานะ
 */
type StatusFilter = "all" | "open" | "closed";

// ================= Columns =================
/*
 * คำอธิบาย : คอลัมน์ของตารางข้อมูลชุมชน
 */
const columns: Column<CommunityRow>[] = [
  {
    key: "name",
    header: "ชื่อชุมชน",
    className: "min-w-[240px]",
    render: (row) => (
      <Link
        to={`/super/community/${row.id}`}
        className="text-dark-green hover:underline font-medium inline-block max-w-full truncate"
        onClick={(e) => e.stopPropagation()}
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

/*
 * คำอธิบาย : Component สำหรับแสดงหน้าจัดการชุมชน (Super Admin)
 * หน้าที่ : ดึงข้อมูลชุมชน แสดงในตาราง พร้อมตัวกรอง ค้นหา และปุ่มเพิ่ม/แก้ไข/ลบ
 */
export default function ManageCommunitySuperAdmin() {
  const navigate = useNavigate();

  // ====== State ======
  const [rows, setRows] = useState<CommunityRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  // ====== Filter + Search ======
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // สร้าง options สำหรับ dropdown สถานะ
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
   * Output : เซตข้อมูลชุมชนลง state rows
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getCommunities(currentPage, pageSize);
      const payload = res.data?.data;

      const list: ApiCommunity[] = Array.isArray(payload?.data) ? payload.data : [];
      const pg = payload?.pagination ?? {};

      const mapped: CommunityRow[] = list.map((c) => ({
        id: c.id,
        name: c.name ?? "-",
        province: c.location?.province ?? "-",
        status: c.status ?? "CLOSED",
        admin: c.admin ? `${c.admin.fname ?? ""} ${c.admin.lname ?? ""}`.trim() : "-",
      }));

      setRows(mapped);
      setTotalItems(pg?.totalCount ?? mapped.length);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) setErrorMessage(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      else setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  // รีเซ็ตหน้าเป็นหน้าแรกเมื่อเปลี่ยน search หรือ filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  /*
   * คำอธิบาย : ฟังก์ชันกรองข้อมูลก่อนแสดงในตาราง
   * Input : rows, searchQuery, statusFilter
   * Output : ข้อมูลที่ผ่านการกรองแล้ว
   */
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);

    return rows.filter((row) => {
      const haystacks = [row.name, row.province, row.admin, row.status].map((v) =>
        normalizeText(String(v ?? ""))
      );
      const passSearch = !q || haystacks.some((h) => h.includes(q));

      const s = (row.status ?? "").toString().toUpperCase();
      const passStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && s === "OPEN") ||
        (statusFilter === "closed" && s === "CLOSED");

      return passSearch && passStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลชุมชนตาม ID
   * Input : communityId (number)
   * Output : ไม่มี (เรียก API ลบข้อมูลแล้วจบ)
   */
  const handleDelete = useCallback(async (communityId: number) => {
    await deleteCommunity(Number(communityId));
  }, []);

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
      setOpenConfirm(false);
      setDeleteId(null);
      setBulkDeleteIds([]);
    }
  }, [deleteId, bulkDeleteIds, handleDelete, reload]);

  const handleCancelDelete = useCallback(() => {
    setOpenConfirm(false);
    setDeleteId(null);
    setBulkDeleteIds([]);
  }, []);

  /*
   * คำอธิบาย : การจัดการแบบเลือกหลายรายการ (Bulk Delete)
   */
  const bulkActions: BulkAction<CommunityRow>[] = useMemo(
    () => [
      {
        id: "bulk-delete",
        label: "ลบทั้งหมด",
        icon: TrashIcon,
        intent: "neutral",
        onClick: (rows) => {
          const ids = rows.map((r) => r.id);
          setBulkDeleteIds(ids);
          setConfirmMessage(`ยืนยันลบ ${ids.length} รายการหรือไม่?`);
          setOpenConfirm(true);
        },
      },
    ],
    []
  );

  /*
   * คำอธิบาย : การตั้งค่าปุ่มจัดการต่อแถว (แก้ไข / ลบ)
   * Input : row ข้อมูลของแต่ละแถว
   * Output : ทำงานตาม action ที่ผู้ใช้เลือก
   */
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
        setOpenConfirm(true);
      },
    },
  };

  // ================= Render =================
  return (
    <div className="space-y-4 cursor-default">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
  current={{
    label: "จัดการชุมชน",
    to: "/super/communities",
    fromSidebar: true,
  }}
/>

      </div>

      {/* ส่วนหัวข้อและ Toolbar */}
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-xl font-bold">จัดการชุมชน</h1>

        {/* Toolbar: Search + Filter + Add */}
        <div className="flex items-center gap-3">
          <div className="max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <FilterDropdown
            options={statusOptions as unknown as { label: string; value: string }[]}
            selected={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
          />

          <div className="ml-auto">
            <Button onClick={() => navigate("/super/community/create")} aria-label="เพิ่มชุมชนใหม่">
              <span>+ เพิ่มชุมชน</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      {/* Table */}
      <DataTable<CommunityRow>
        data={filteredRows}
        columns={columns}
        getKey={(row) => String(row.id)} // ใช้ getKey (ต้อง return string)
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 30, 50]} // มีใน type เดิม
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / pageSize),
          totalCount: totalItems,
          limit: pageSize,
        }} // ใช้ object pagination ตาม component จริง
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => setPageSize(s)}
        isLoading={isLoading}
        theme="brand"
        // อย่าใส่ className / striped / defaultPageSize
      />

      {/* Modal ยืนยันการลบ */}
      <Modal
        open={openConfirm}
        title="ยืนยันการลบชุมชน"
        text={confirmMessage}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
