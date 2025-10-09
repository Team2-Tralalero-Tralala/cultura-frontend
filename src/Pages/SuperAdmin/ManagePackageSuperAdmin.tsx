// src/Pages/SuperAdmin/ManagePackageSuperAdmin.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import { fetchPackagesByRole} from "../../Services/package-services";
import type { PackageRow } from "../../Types/Package";
import { api } from "../../Libs/axios";

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
    },
  },
];

export default function ManagePackageSuperAdmin() {
  const navigate = useNavigate();

  // 1) ประกาศ state ให้ครบก่อนใช้
  const [rows, setRows] = React.useState<PackageRow[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // 2) จากนั้นค่อยประกาศฟังก์ชันโหลด (อ้างอิง page/limit ได้แล้ว)
  const reloadPackages = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { rows, total } = await fetchPackagesByRole("superadmin", page, limit);
      setRows(rows);
      setTotal(total);
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // 3) แล้วค่อยประกาศ actions (อ้างอิง reloadPackages)
  const actions: DataTableActionsConfig<PackageRow> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (r) => navigate(`/super/package/${r.id}`),
        delete: async (r) => {
          if (!window.confirm(`ยืนยันลบแพ็กเกจ "${r.title}" ?`)) return;
          try {
            await api.patch(`/super/package/${r.id}`);
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

  // 4) ค่อยเรียกใช้ใน effect
  React.useEffect(() => {
    reloadPackages();
  }, [reloadPackages]);

  const goToApprovalRequests = () => navigate("/super/package-requests");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // หน้านี้คือ SuperAdmin → ใช้ role = "superadmin"
      const { rows, total, page: p, limit: l } = await fetchPackagesByRole("superadmin", page, limit);
      setRows(rows);
      setTotal(total);
      // (p,l) ไม่จำเป็นต้อง set ถ้าใช้ state ของเราเอง
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pendingCount = React.useMemo(() => rows.filter((r) => !r.approved).length, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={goToApprovalRequests}
            className="ml-auto inline-flex items-center gap-2 rounded-form px-4 py-2 text-white
                       bg-[#055035] hover:bg-[#04402a] shadow-sm transition"
          >
            <span>คำขออนุมัติ</span>
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full
                               bg-white/90 px-1 text-xs font-semibold text-dark-green">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <DataTable<PackageRow>
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={actions}
        bulkActions={bulkActions}
        selectable
        striped
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={limit}
        onPageChange={(p) => setPage(p)}                 // ถ้า DataTable รองรับ
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
