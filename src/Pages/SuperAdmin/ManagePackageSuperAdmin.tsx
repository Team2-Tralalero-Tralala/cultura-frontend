// src/Pages/SuperAdmin/ManagePackageSuperAdmin.tsx
import React, { useMemo } from "react";

// คอมโพเนนต์ตาราง
import DataTable from "../../Components/Tables/Index";

// types (type-only)
import type {
  Column,
  DataTableProps,
  BulkAction,
  DataTableActionsConfig,
} from "../../Components/Tables/Types";

// ไอคอนปุ่ม
import { TrashIcon } from "../../Components/Tables/Icon";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

// ---------- ชนิดข้อมูลของแถว ----------
type PackageRow = {
  id: number;
  title: string;          // ชื่อแพ็กเกจ
  community: string;      // ชื่อชุมชน
  owner: string;          // ผู้ดูแล
  published: boolean;     // สถานะแพ็กเกจ (เผยแพร่/ไม่เผยแพร่)
  approved: boolean;      // สถานะการอนุมัติ (อนุมัติ/รออนุมัติ)
};

// ---------- mock data ให้หน้าตาเหมือนภาพ ----------
function useMockRows(): PackageRow[] {
  const titles = [
    "แพ็กเกจทัวร์เกาะยง & เกาะซ้าง",
    "ชมพิพิธภัณฑ์ศิลปะในฝัน Art....",
    "ชิมความงามของอ่างหัวยาง",
    "เที่ยวชมย่านประวัติศาสตร์วัดโพธิ์",
    "เที่ยวชุมชนอ่าวกองงาม",
    "ทัวร์แก่งแท่นเพ็ชร",
    "เดินป่าคอยอนพนทก์",
    "เที่ยวไร่ชาวญี่ปุ่น",
    "ชมเรือนไทยอยุธยา",
    "ทัวร์สนอัศจรรย์ฟาร์มวิลเลต",
  ];
  const communities = [
    "ชุมชนบ้านคลองเจ้า",
    "ชุมชนบ้านคงไม้แน่น",
    "ชุมชนบ้านสามช่อง",
    "ชุมชนบ้านเมืองเก่า",
    "ชุมชนบ้านอ่าวทอง",
    "ชุมชนแก่งแท่นเพ็ชร",
    "ชุมชนแม่กลางหลวง",
    "ชุมชนบ้านหัวหิน",
    "ชุมชนคลองสระบัว",
    "ชุมชนคลองลาวงาม",
  ];
  const owners = [
    "ศรัณณา เม่นแต๋",
    "อเล็กซ์ แซพพล",
    "ไออาน่า หวัง",
    "นิโคลัส เกา",
    "เอมิลี่ ลัง",
    "โพเพียง โววา",
    "แองเจล่า ชู",
    "แดนเนียล ลี",
    "อภิสิทธิ์ พลีลธเนษาง",
    "เวสลี่ พลัสจงเฟย",
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: titles[i],
    community: communities[i],
    owner: owners[i],
    // สลับสถานะให้ดูมีทั้งเผยแพร่/ไม่เผยแพร่ และ อนุมัติ/รออนุมัติ
    published: i % 3 !== 1,   // true => "เผยแพร่", false => "ไม่เผยแพร่"
    approved: i % 3 !== 2,    // true => "อนุมัติ", false => "รออนุมัติ"
  }));
}

// ---------- คอลัมน์ ----------
const columns: Column<PackageRow>[] = [
  { key: "title", header: "ชื่อแพ็กเกจ", className: "min-w-[240px]" },
  { key: "community", header: "ชื่อชุมชน" },
  { key: "owner", header: "ผู้ดูแล" },
  {
    key: "published",
    header: "สถานะแพ็กเกจ",
    render: (r) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่"),
  },
  {
    key: "approved",
    header: "สถานะการอนุมัติ",
    render: (r) => (r.approved ? "อนุมัติ" : "รออนุมัติ"),
  },
];

// ---------- ปุ่มจัดการต่อแถว ----------
const actions: DataTableActionsConfig<PackageRow> = {
  header: "จัดการ",
  align: "right",
  width: "120px",
  variant: "icons", // แสดงเป็นไอคอน (เช่น ✏️ 🗑️) ตาม component ของคุณ
  items: () => ["edit", "delete"], // preset จากระบบคุณ
  callbacks: {
    edit:   (r) => console.log("edit", r.id),
    delete: (r) => console.log("delete", r.id),
  },
};

// ---------- ปุ่มแบบกลุ่ม ----------
const bulkActions: BulkAction<PackageRow>[] = [
  {
    id: "bulk-delete",
    label: "ลบทั้งหมด",
    icon: TrashIcon,
    intent: "danger",
    confirm: (rows) => `ยืนยันลบ ${rows.length} รายการหรือไม่?`,
    onClick: async (rows) => {
      const ids = rows.map((r) => r.id);
      console.log("bulk delete:", ids);
      // await fetch("/api/packages/bulk-delete", { method:"POST", body: JSON.stringify({ ids }) });
    },
  },
];

// ---------- หน้าเพจ ----------
export default function ManagePackageSuperAdmin() {
  const rows = useMockRows();
  const navigate = useNavigate();
  const pendingCount = rows.filter((r) => !r.approved).length;
  const goToApprovalRequests = () => navigate("/super/package-requests");


  return (
    <div className="space-y-4">
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

    <button
      onClick={goToApprovalRequests}
      className="ml-auto relative inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
    >
      <span>คำขออนุมัติ</span>
      {/* badge จำนวนที่รออนุมัติ ถ้าจะใช้ค่อย uncomment พร้อมตัวแปร pendingCount */}
      {/* {pendingCount > 0 && (
        <span className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full
                        bg-white/90 px-1 text-xs font-semibold text-dark-green">
          {pendingCount}
        </span>
      )} */}
    </button>
  </div>

  {/* ตาราง (แถวล่าง) */}
  <DataTable<PackageRow>
    data={rows}
    columns={columns}
    getRowKey={(r) => r.id}
    actions={actions}
    bulkActions={bulkActions}
    selectable
    striped
    pageSizeOptions={[10, 20, 50]}
    defaultPageSize={10}
    theme="brand"
    className="bg-white rounded-lg"
  />
</div>

    
  );
}
