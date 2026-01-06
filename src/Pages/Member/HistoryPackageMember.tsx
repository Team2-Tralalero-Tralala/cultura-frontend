/*
 * คำอธิบาย : Component สำหรับหน้า “ประวัติแพ็กเกจ” ของสมาชิก
 * แสดงรายการแพ็กเกจที่สมาชิกได้สร้างและสิ้นสุดไปแล้ว
 */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import type { Column, Pagination, DataTableActionsConfig, BulkAction } from "@/Components/Tables/Types";
import { getHistoriesPackageMember, deletePackageAdmin } from "@/Services/package-services";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

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
const normalizeText = (str: string) =>
  (str ?? "")
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
 * คำอธิบาย : ฟังก์ชันสำหรับกำหนดคอลัมน์ของตารางประวัติแพ็กเกจ
 * Input : ไม่มี
 * Output : รายการคอลัมน์ของตาราง
 */
const columns: Column<PackageHistoryRow>[] = [
  {
    key: "name",
    header: "ชื่อแพ็กเกจ",
    className: "min-w-[220px]",
    render: (row) => (
      <Link
        to={`/member/package/${row.id}`}
        className="hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  { key: "community", header: "ชื่อชุมชน", className: "min-w-[200px]" },
  { key: "overseer", header: "ผู้ดูแล", className: "min-w-[140px]" },
  { key: "status", header: "สถานะแพ็กเกจ", className: "min-w-[160px]" },
  {
    key: "dueDate",
    header: "เวลาสิ้นสุด",
    render: (row) => formatThaiDateTime(row.dueDate),
  },
];

/*
 * คำอธิบาย : ฟังก์ชันหลักของหน้า ประวัติแพ็กเกจ สมาชิก
 * Input : ไม่มี
 * Output : ส่วนแสดงผลของหน้า ประวัติแพ็กเกจ สมาชิก
 */
export default function PackageHistoryMember() {
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
  const [communityName, setCommunityName] = useState<string>("");

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลแพ็กเกจจาก backend
   * Input : ไม่มี
   * Output : อัปเดต state rows และ pagination
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHistoriesPackageMember(
        pagination.currentPage,
        pagination.limit
      );

      const list = res?.data?.data ?? [];
      const packages = res?.data?.pagination ?? {};

      const mapped = list.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name ?? "-",
        community: pkg.community?.name ?? "-",
        overseer: `${pkg.overseerPackage?.fname ?? ""} ${pkg.overseerPackage?.lname ?? ""}`.trim(),
        status: (pkg.statusPackage === "PUBLISH" || pkg.statusPackage === "UNPUBLISH") ? "จบแล้ว" : pkg.statusPackage,
        dueDate: pkg.dueDate,
      }));

      if (list.length > 0) {
        setCommunityName(list[0].community?.name || "ชุมชน");
      }

      setRows(mapped);
      setPagination({
        currentPage: packages.currentPage ?? 1,
        totalPages: packages.totalPages ?? 1,
        totalCount: packages.totalCount ?? mapped.length,
        limit: packages.limit ?? pagination.limit,
      });
    } catch (error: any) {
      console.error("Failed to fetch packages:", error);
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชัน useEffect สำหรับโหลดข้อมูลเมื่อเปลี่ยนหน้า หรือจำนวนเรคอร์ดต่อหน้า
   * Input : pagination.currentPage, pagination.limit
   * Output : เรียก fetchData เพื่อโหลดข้อมูลใหม่
   */
  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.limit]);

  /*
   * คำอธิบาย : ฟังก์ชัน useEffect สำหรับโหลดชื่อชุมชนเมื่อคอมโพเนนต์ถูกสร้างขึ้น
   * Input : -
   * Output : อัปเดต state communityName
   */
  const rowActions: DataTableActionsConfig<PackageHistoryRow> = {
    header: "จัดการ",
    align: "left",
    width: "150px",
    variant: "icons",
    items: () => ["copy", "delete"],
    callbacks: {
      copy: (row) => navigate(``),
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
    const query = normalizeText(searchQuery);
    return rows.filter((row) => {
      const haystacks = [row.name, row.community, row.overseer, row.dueDate].map((value) =>
        normalizeText(String(value ?? ""))
      );
      return !query || haystacks.some((haystack) => haystack.includes(query));
    });
  }, [rows, searchQuery]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลบแพ็กเกจเดี่ยว (ใช้รหัสแพ็กเกจ)
   * Input : id (number)
   * Output : void
   */
  const handleDelete = async (id: number) => {
    try {
      await deletePackageAdmin(id);
      setOpenConfirm(false);
      setDeleteId(null);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete package:", error);
      alert(
        `ลบไม่สำเร็จ: ${error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "unknown error"
        }`
      );
      setErrorMessage(error?.message ?? "ไม่สามารถลบแพ็กเกจได้");
    }
  };


  /*
   * คำอธิบาย : ฟังก์ชันการลบแพ็กเกจหลายอันพร้อมกัน (Bulk Delete)
   * Input : rows (รายการแพ็กเกจที่เลือก)
   * Output : void
   */
  const bulkActions: BulkAction<PackageHistoryRow>[] = [
    {
      id: "bulk-delete",
      label: "ลบทั้งหมด",
      icon: TrashIcon,
      intent: "neutral",
      confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
      onClick: async (rows) => {
        const packageIds = rows.map((row) => row.id);
        alert("Bulk delete: " + packageIds);
        await fetchData();
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <div>
          <Breadcrumb
            current={{
              label: "ประวัติแพ็กเกจ",
              to: `/member/packages/done`,
            }}
          />
        </div>

        <h1 className="text-xl font-bold "> ประวัติแพ็กเกจ </h1>

        <div className="flex items-center justify-between w-full ">
          <div className="w-[260px]">
            <SearchBarTable value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>

          <div>
            <Button onClick={() => navigate("/member/package/create")} aria-label="สร้างแพ็กเกจ">
              <span className="text-lg leading-none">＋</span>
              <span>สร้างแพ็กเกจ</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-10">
        {errorMessage && <div className="text-sm text-red-600 mb-2">{errorMessage}</div>}

        <DataTable<PackageHistoryRow>
          data={filteredRows}
          getKey={(row) => row.id.toString()}
          columns={columns}
          actions={rowActions}
          bulkActions={bulkActions}
          selectable
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          onPageSizeChange={(limit) =>
            setPagination((prev) => ({ ...prev, currentPage: 1, limit }))
          }
          pageSizeOptions={[10, 30, 50]}
          theme="brand"
        />
      </div>

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
