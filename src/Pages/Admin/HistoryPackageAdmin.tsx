import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import type { Column, Pagination, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";
import { getHistoriesPackageAdmin } from "@/Services/package-services";

type PackageHistoryRow = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  dueDate: string;
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับจัดรูปแบบข้อความให้เป็นตัวพิมพ์เล็ก และลบช่องว่างเกินออก
 * Input : string
 * Output : string ที่ผ่านการ normalize แล้ว
 */
const normalizeText = (s: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงเวลา ISO จาก backend ให้อยู่ในรูปแบบวันที่/เวลาภาษาไทย
 * Input : iso (string)
 * Output : วันที่และเวลาในรูปแบบไทย เช่น "09 พ.ย. 2568 | 00:00 น."
 */
const formatThaiDateTime = (iso: string) => {
  if (!iso) return "-";
  const date = new Date(iso);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear() + 543;

  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} | ${hours}:${minutes} น.`;
};

/*
 * คำอธิบาย : คอลัมน์ที่ใช้ในตาราง DataTable สำหรับแสดงข้อมูลแพ็กเกจ
 */
const columns: Column<PackageHistoryRow>[] = [
  { key: "name", header: "ชื่อแพ็กเกจ", className: "min-w-[220px]" },
  { key: "community", header: "ชื่อชุมชน", className: "min-w-[200px]" },
  { key: "overseer", header: "ผู้ดูแล", className: "min-w-[140px]" },
  { key: "status", header: "สถานะแพ็กเกจ", className: "min-w-[160px]" },
  {
    key: "dueDate",
    header: "เวลาสิ้นสุด",
    render: (r) => formatThaiDateTime(r.dueDate),
  },
];

/*
 * คำอธิบาย : Component หลักสำหรับหน้า “ประวัติแพ็กเกจ” ของแอดมิน
 */
export default function PackageHistoryAdmin() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<PackageHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลแพ็กเกจจาก backend
   * Output : อัปเดต state rows และ pagination
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHistoriesPackageAdmin(
        pagination.currentPage,
        pagination.limit
      );

      console.log("📦 API Response:", res);

      const list = res?.data?.data ?? [];
      const pag = res?.data?.pagination ?? {};

      const mapped = list.map((p: any) => ({
        id: p.id,
        name: p.name ?? "-",
        community: p.community?.name ?? "-",
        overseer: `${p.overseerPackage?.fname ?? ""} ${p.overseerPackage?.lname ?? ""}`.trim(),
        status: p.statusPackage === "PUBLISH" ? "จบแล้ว" : p.statusPackage,
        dueDate: p.dueDate,
      }));

      setRows(mapped);
      setPagination({
        currentPage: pag.currentPage ?? 1,
        totalPages: pag.totalPages ?? 1,
        totalCount: pag.totalCount ?? mapped.length,
        limit: pag.limit ?? pagination.limit,
      });
    } catch (e: any) {
      console.error("Failed to fetch packages:", e);
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * คำอธิบาย : โหลดข้อมูลเมื่อมีการเปลี่ยนหน้า (pagination)
   */
  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit]);

  /*
   * คำอธิบาย : การตั้งค่า Action สำหรับแต่ละแถว เช่น แก้ไข หรือ ลบ
   */
  const rowActions: DataTableActionsConfig<PackageHistoryRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["copy", "delete"],
    callbacks: {
      copy: (row) => navigate(``), //ตะวันแก้
      delete: (row) => {
        setDeleteId(row.id);
        setOpenConfirm(true);
      },
    },
  };

  /*
   * คำอธิบาย : ฟังก์ชันกรองข้อมูลในตารางตามข้อความค้นหา
   * Input : searchQuery
   * Output : แถวข้อมูลที่ตรงกับคำค้นหา
   */
  const filteredRows = useMemo(() => {
    const q = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.community, row.overseer, row.dueDate].map((v) =>
        normalizeText(String(v ?? ""))
      );
      return !q || haystacks.some((h) => h.includes(q));
    });
  }, [rows, searchQuery]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลบแพ็กเกจเดี่ยว (ใช้รหัสแพ็กเกจ)
   * Input : id (number)
   */
  const handleDelete = async (id: number) => {
    console.log("🗑 ลบ package:", id);
  };

  /*
   * คำอธิบาย : การลบแพ็กเกจหลายอันพร้อมกัน (Bulk Delete)
   * Input : rows (รายการแพ็กเกจที่เลือก)
   */
  const bulkActions: BulkAction<PackageHistoryRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const ids = rows.map((r) => r.id);
        alert("Bulk delete: " + ids);
        await fetchData();
      },
    },
  ];

  /*
   * คำอธิบาย : ส่วนแสดงผลหน้าเว็บ (UI)
   */
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="px-6 pb-1">
        <nav aria-label="breadcrumb" className="flex items-center text-gray-700 text-sm">
          <span className="text-gray-800 font-medium">ประวัติแพ็กเกจ</span>
        </nav>
      </div>

      {/* Header */}
      <div className="px-6 py-1 flex items-center justify-between">
        <h2 className="text-xl font-semibold">ประวัติแพ็กเกจ</h2>
        <div>
          <Button onClick={() => navigate("/admin/package/create")} aria-label="สร้างแพ็กเกจ">
            + สร้างแพ็กเกจ
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-2">
        <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Table */}
      <div className="px-6 pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        <DataTable<PackageHistoryRow>
          data={filteredRows}
          getKey={(r) => r.id.toString()}
          columns={columns}
          actions={rowActions}
          bulkActions={bulkActions}
          selectable
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(p) =>
            setPagination((prev) => ({ ...prev, currentPage: p }))
          }
          onPageSizeChange={(limit) =>
            setPagination((prev) => ({ ...prev, currentPage: 1, limit }))
          }
          pageSizeOptions={[10, 30, 50]}
          theme="brand"
        />
      </div>

      {/* Modal ยืนยันลบ */}
      <Modal
        open={openConfirm}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        onConfirm={async () => {
          if (!deleteId) return;
          await handleDelete(deleteId);
          setOpenConfirm(false);
          setDeleteId(null);
          await fetchData();
        }}
        onCancel={() => {
          setOpenConfirm(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
