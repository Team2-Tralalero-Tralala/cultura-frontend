import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import { fetchPackagesByRole } from "../../Services/package-services";
import type { PackageRow } from "../../Types/Package";
import { api } from "../../Libs/axios";
import SearchBarTable from "../../Components/Search/SerachBarTable";

const columns: Column<PackageRow>[] = [
  { key: "title", header: "ชื่อแพ็กเกจ", className: "min-w-[240px]" },
  { key: "community", header: "ชื่อชุมชน" },
  { key: "owner", header: "ผู้ดูแล" },
  { key: "published", header: "สถานะแพ็กเกจ", render: (r) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่") },
  { key: "approved", header: "สถานะการอนุมัติ", render: (r) => (r.approved ? "อนุมัติ" : "รออนุมัติ") },
];

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
      // TODO: ถ้ามี endpoint bulk delete ให้เรียกที่นี่
    },
  },
];

export default function ManagePackageAdmin() {
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<PackageRow[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // โหลดข้อมูล (role = admin)
  const reloadPackages = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { rows, total } = await fetchPackagesByRole("admin", page, limit);
      setRows(rows);
      setTotal(total);
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // actions ต่อแถว (ชี้ backend /admin/)
  const actions: DataTableActionsConfig<PackageRow> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (r) => navigate(`/admin/package/${r.id}`),
        delete: async (r) => {
          if (!window.confirm(`ยืนยันลบแพ็กเกจ "${r.title}" ?`)) return;
          try {
            await api.patch(`/admin/package/${r.id}`); // soft-delete ตาม backend
            await reloadPackages();
          } catch (e: any) {
            console.error(e);
            alert(`ลบไม่สำเร็จ: ${e?.message ?? "unknown error"}`);
          }
        },
      },
    }),
    [navigate, reloadPackages]
  );

  React.useEffect(() => {
    reloadPackages();
  }, [reloadPackages]);

  // ค้นหา (client-side)
  const [query, setQuery] = useState("");
  const norm = (s: string) =>
    (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
  const toPublishedText = (r: PackageRow) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่");
  const toApprovedText  = (r: PackageRow) => (r.approved ? "อนุมัติ" : "รออนุมัติ");

  const filteredRows = React.useMemo(() => {
    const q = norm(query);
    if (!q) return rows;
    return rows.filter((r) => {
      const haystacks = [r.title, r.community, r.owner, toPublishedText(r), toApprovedText(r)].map(norm);
      return haystacks.some((h) => h.includes(q));
    });
  }, [rows, query]);

  React.useEffect(() => {
    setPage(1);
  }, [query]);

  // ปุ่มด้านขวา
  const goToCreatePackage    = () => navigate("/admin/package");
  const goToApprovalRequests = () => navigate("/admin/package-requests"); // มีไฟล์ PackageRequestAdmin.tsx ตามลิสต์ของคุณ

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

        {/* แถวเดียวกัน */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={goToApprovalRequests}
              className="inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                        bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
            >
              <span>คำขออนุมัติ</span>
            </button>

            <button
              onClick={goToCreatePackage}
              className="inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                        bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
            >
              <span className="text-xl leading-none">＋</span>
              <span>สร้างแพ็กเกจ</span>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <DataTable<PackageRow>
        data={filteredRows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={actions}
        bulkActions={bulkActions}
        selectable
        striped
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={limit}
        onPageChange={(p) => setPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
