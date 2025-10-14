/**
 * Coding Standard (Frontend)
 * - ใช้ชื่อที่สื่อความหมาย: currentPage, pageSize, isLoading, errorMessage, searchQuery
 * - ใส่คอมเมนต์สั้นอธิบาย data shaping และการค้นหา client-side
 */

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

  const [tableRows, setTableRows] = React.useState<PackageRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /** โหลดข้อมูล (role = admin) */
  const reloadPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const { rows, total } = await fetchPackagesByRole("admin", currentPage, pageSize);
      setTableRows(rows);
      setTotalItems(total);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  /** การกระทำต่อแถวในตาราง (ผูกกับ backend /admin/) */
  const rowActions: DataTableActionsConfig<PackageRow> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/admin/package/${row.id}`),
        delete: async (row) => {
          if (!window.confirm(`ยืนยันลบแพ็กเกจ "${row.title}" ?`)) return;
          try {
            await api.patch(`/admin/package/${row.id}`); // soft-delete ตาม backend
            await reloadPackages();
          } catch (error: any) {
            console.error(error);
            alert(`ลบไม่สำเร็จ: ${error?.message ?? "unknown error"}`);
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
  const [searchQuery, setSearchQuery] = useState("");
  const normalizeText = (s: string) =>
    (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();
  const toPublishedText = (r: PackageRow) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่");
  const toApprovedText = (r: PackageRow) => (r.approved ? "อนุมัติ" : "รออนุมัติ");

  const filteredRows = React.useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return tableRows;
    return tableRows.filter((r) => {
      const haystacks = [r.title, r.community, r.owner, toPublishedText(r), toApprovedText(r)].map(
        normalizeText
      );
      return haystacks.some((h) => h.includes(q));
    });
  }, [tableRows, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const goToCreatePackage = () => navigate("/admin/package");
  const goToApprovalRequests = () => navigate("/admin/package-requests");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<PackageRow>
        data={filteredRows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        striped
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
