/**
 * คำอธิบาย: Component สำหรับหน้า “ประวัติแพ็กเกจ” ของสมาชิก
 * - แสดงรายการแพ็กเกจที่สมาชิกได้สร้างและสิ้นสุดไปแล้ว
 */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";

import { Modal } from "@/Components/Modal/Modal";
import { TrashIcon } from "@/Components/Tables/Icon";
import type {
  Column,
  Pagination,
  DataTableActionsConfig,
  BulkAction,
} from "@/Components/Tables/Types";
import { getHistoriesPackageMember, deletePackageAdmin } from "@/Libs/PackageService";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

type PackageHistoryRow = {
  id: number;
  name: string;
  community: string;
  overseer: string;
  status: string;
  dueDate: string;
};

/**
 * คำอธิบาย: ฟังก์ชันสำหรับจัดรูปแบบข้อความให้เป็นตัวพิมพ์เล็ก และลบช่องว่างเกินออก
 * Input: str (string)
 * Output: string ที่ผ่านการ normalize แล้ว
 */
const normalizeText = (str: string) =>
  (str ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * คำอธิบาย: ฟังก์ชันสำหรับแปลงเวลา ISO จาก backend ให้อยู่ในรูปแบบวันที่/เวลาภาษาไทย
 * Input: iso (string)
 * Output: วันที่และเวลาในรูปแบบไทย เช่น "09 พ.ย. 2568 | 00:00 น."
 */
const formatThaiDateTime = (iso: string) => {
  if (!iso) return "-";
  const date = new Date(iso);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear() + 543;

  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} | ${hours}:${minutes} น.`;
};

/**
 * คำอธิบาย: ฟังก์ชันสำหรับกำหนดคอลัมน์ของตารางประวัติแพ็กเกจ
 * Input: -
 * Output: รายการคอลัมน์ของตาราง
 */
const columns: Column<PackageHistoryRow>[] = [
  {
    key: "name",
    header: "ชื่อแพ็กเกจ",
    className: "min-w-[220px]",
    render: (row) => (
      <Link to={`/member/package/history/${row.id}`} className="hover:text-dark-green hover:underline">
        {row.name}
      </Link>
    ),
  },
  { key: "community", header: "ชื่อชุมชน", className: "min-w-[200px]" },
  { key: "overseer", header: "ผู้ดูแล", className: "min-w-[140px]" },
  { key: "status", header: "สถานะแพ็กเกจ", className: "min-w-[160px]" },
  {
    key: "dueDate",
    header: "วัน-เวลาสิ้นสุด",
    render: (row) => formatThaiDateTime(row.dueDate),
  },
];

/**
 * คำอธิบาย: ฟังก์ชันหลักของหน้า ประวัติแพ็กเกจ สมาชิก
 * Input: -
 * Output: ส่วนแสดงผลของหน้า ประวัติแพ็กเกจ สมาชิก
 */
export default function ManagePackageHistoryPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<PackageHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [packageIdToDelete, setPackageIdToDelete] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [communityName, setCommunityName] = useState<string>("");

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับแปลงข้อความเป็นตัวพิมพ์เล็กและตัดช่องว่าง
   * Input: textValue (string)
   * Output: ข้อความที่ผ่านการจัดรูปแบบแล้ว (string)
   */
  const normalizeText = (textValue: string) =>
    (textValue ?? "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  /**
   * คำอธิบาย: ตัวแปรสำหรับกรองข้อมูลแพ็กเกจตามคำค้นหา
   * Input: rows, searchQuery
   * Output: รายการแพ็กเกจที่ตรงกับคำค้นหา
   */
  const filteredRows = React.useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    if (!normalizedQuery) return rows;

    return rows.filter((row) =>
      [row.name, row.community, row.overseer, row.status]
        .map(normalizeText)
        .some((fieldValue) => fieldValue.includes(normalizedQuery)),
    );
  }, [rows, searchQuery]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับโหลดข้อมูลแพ็กเกจจาก backend
   * Input: -
   * Output: - (อัปเดต state packageHistoryRows และ pagination)
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getHistoriesPackageMember(pagination.currentPage, pagination.limit);

      const packageList = res?.data?.data ?? [];
      const paginationData = res?.data?.pagination ?? {};

      const mappedRows: PackageHistoryRow[] = packageList.map((packageItem: any) => ({
        id: packageItem.id,
        name: packageItem.name ?? "-",
        community: packageItem.community?.name ?? "-",
        overseer:
          `${packageItem.overseerPackage?.fname ?? ""} ${packageItem.overseerPackage?.lname ?? ""}`.trim(),
        status: packageItem.statusPackage === "PUBLISH" ? "จบแล้ว" : (packageItem.status === "CLOSED" ? "สิ้นสุดกิจกรรม" : packageItem.statusPackage ?? packageItem.status),
        dueDate: packageItem.dueDate,
        bookedCount: packageItem.booked_count ?? 0,
        capacity: packageItem.capacity ?? 0,
        tags: Array.isArray(packageItem.tags) ? packageItem.tags.map((t: any) => t.name) : [],
      }));

      if (packageList.length > 0) {
        setCommunityName(packageList[0].community?.name || "ชุมชน");
      }

      setRows(mappedRows);
      setPagination({
        currentPage: paginationData.currentPage ?? 1,
        limit: paginationData.limit ?? 10,
        totalCount: paginationData.totalCount ?? 0,
        totalPages: paginationData.totalPages ?? 1,
      });
    } catch (error: any) {
      console.error("Failed to fetch packages:", error);
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชัน useEffect สำหรับโหลดข้อมูลเมื่อเปลี่ยนหน้า หรือจำนวนเรคอร์ดต่อหน้า
   * Input: pagination.currentPage, pagination.limit
   * Output: - (เรียก fetchData เพื่อโหลดข้อมูลใหม่)
   */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delay);
  }, [pagination.currentPage, pagination.limit]);

  /**
   * คำอธิบาย: การจัดการ Action บน row (copy, delete)
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
        setPackageIdToDelete(row.id);
        setIsOpenConfirm(true);
      },
    },
  };

  /**
   * คำอธิบาย: ฟังก์ชันกรองข้อมูลในตารางตามข้อความค้นหา
   * Input: searchQuery
   * Output: แถวข้อมูลที่ตรงกับคำค้นหา
   */


  /**
   * คำอธิบาย: ฟังก์ชันสำหรับลบแพ็กเกจเดี่ยว (ใช้รหัสแพ็กเกจ)
   * Input: id (number)
   * Output: - (ลบแพ็กเกจและโหลดข้อมูลใหม่)
   */
  const handleDelete = async (id: number) => {
    try {
      await deletePackageAdmin(id);
      setIsOpenConfirm(false);
      setPackageIdToDelete(null);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete package:", error);
      alert(
        `ลบไม่สำเร็จ: ${error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "unknown error"
        }`,
      );
      setErrorMessage(error?.message ?? "ไม่สามารถลบแพ็กเกจได้");
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชันการลบแพ็กเกจหลายอันพร้อมกัน (Bulk Delete)
   * Input: rows (รายการแพ็กเกจที่เลือก)
   * Output: - (Alert ข้อมูลลบแพ็กเกจ)
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
            <SearchBarTable
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
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
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
          onPageSizeChange={(limit) =>
            setPagination((prev) => ({ ...prev, currentPage: 1, limit }))
          }
          pageSizeOptions={[10, 30, 50]}
          theme="brand"
        />
      </div>

      <Modal
        isOpen={isOpenConfirm}
        title="ยืนยันการลบแพ็กเกจ"
        text="คุณต้องการลบแพ็กเกจนี้หรือไม่?"
        onConfirm={async () => {
          if (!packageIdToDelete) return;
          await handleDelete(packageIdToDelete);
          setIsOpenConfirm(false);
          setPackageIdToDelete(null);
          await fetchData();
        }}
        onCancel={() => {
          setIsOpenConfirm(false);
          setPackageIdToDelete(null);
        }}
      />
    </div>
  );
}
