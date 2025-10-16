/**
 * จัดการแพ็กเกจ (SuperAdmin) — ดึงข้อมูลด้วย axios โดยตรง
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Tables/Index";
import type {
  Column,
  DataTableActionsConfig,
  BulkAction,
} from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import SearchBarTable from "../../components/Search/SearchBarTable";
import axios from "axios";
import Button from "@/Components/Button";

// ====== Config ======
const apiUrl = import.meta.env.VITE_API_URL;

// ====== Local row type (ไม่พึ่ง PackageRow) ======
type Row = {
  id: number;
  title: string;
  community: string;
  owner: string;
  published: boolean;
  approved: boolean;
};

const columns: Column<Row>[] = [
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

const bulkActions: BulkAction<Row>[] = [
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

export default function ManagePackageSuperAdmin() {
  const navigate = useNavigate();

  // table state
  const [tableRows, setTableRows] = React.useState<Row[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // โหลดข้อมูลด้วย axios โดยตรง
  const reloadPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await axios.get(`${apiUrl}/super/packages`, {
        params: { page: currentPage, limit: pageSize },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      const payload = res?.data;
      let listRaw: any =
        payload?.data?.data ??
        payload?.data ??
        payload?.items ??
        payload?.rows ??
        payload;

      if (!Array.isArray(listRaw)) {
        console.warn("Expected array but got:", listRaw);
        listRaw = []; // กันพังไว้ก่อน
      }

      const total =
        payload?.pagination?.totalCount ??
        payload?.data?.pagination?.totalCount ??
        payload?.total ??
        payload?.totalCount ??
        listRaw.length;

      const rows: Row[] = listRaw.map(
        (p: any): Row => ({
          id: Number(p?.id ?? p?.pk_id ?? 0),
          title: p?.name ?? p?.title ?? "-",
          community: p?.community?.name ?? p?.communityName ?? "-",
          owner: p?.overseerPackage
            ? `${p.overseerPackage.fname ?? ""} ${
                p.overseerPackage.lname ?? ""
              }`.trim() ||
              p.overseerPackage.username ||
              "-"
            : p?.ownerName ?? "-",
          published:
            p?.statusPackage === "PUBLISH" ||
            p?.published === true ||
            p?.isPublished === true,
          approved:
            p?.statusApprove === "APPROVE" ||
            p?.approved === true ||
            p?.isApproved === true,
        })
      );

      setTableRows(rows);
      setTotalItems(Number.isFinite(total) ? Number(total) : rows.length);
    } catch (error: any) {
      console.error("reloadPackages error:", error?.response?.data ?? error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "โหลดข้อมูลไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // การกระทำต่อแถว
  const rowActions: DataTableActionsConfig<Row> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/super/package/edit/${row.id}`),
        delete: async (row) => {
          if (!window.confirm(`ยืนยันลบแพ็กเกจ "${row.title}" ?`)) return;
          try {
            // ถ้า backend ของคุณลบด้วย DELETE:
            // await axios.delete(`${apiUrl}/super/package/${row.id}`, { withCredentials: true });

            // ถ้าเป็น soft-delete ด้วย PATCH (สมมติใช้ path นี้):
            await axios.patch(
              `${apiUrl}/super/package/${row.id}/delete`,
              {},
              { withCredentials: true }
            );

            await reloadPackages();
          } catch (error: any) {
            console.error("delete failed:", error?.response?.data ?? error);
            alert(
              `ลบไม่สำเร็จ: ${
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "unknown error"
              }`
            );
          }
        },
      },
    }),
    [navigate, reloadPackages]
  );

  React.useEffect(() => {
    reloadPackages();
  }, [reloadPackages]);

  // ค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  const normalizeText = (s: string) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

  const toPublishedText = (r: Row) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่");
  const toApprovedText = (r: Row) => (r.approved ? "อนุมัติ" : "รออนุมัติ");

  const filteredRows = React.useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return tableRows;
    return tableRows.filter((r) => {
      const haystacks = [
        r.title,
        r.community,
        r.owner,
        toPublishedText(r),
        toApprovedText(r),
      ].map(normalizeText);
      return haystacks.some((h) => h.includes(q));
    });
  }, [tableRows, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const pendingCount = React.useMemo(
    () => tableRows.filter((r) => !r.approved).length,
    [tableRows]
  );

  const goToApprovalRequests = () => navigate("/super/package-requests");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button type="confirm-admin" onClick={goToApprovalRequests}>
              คำขออนุมัติ
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      <DataTable<Row>
        data={filteredRows}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        striped
        // หมายเหตุ: ถ้า DataTable ของคุณรองรับ total/pagination control ให้ส่ง totalItems ด้วย
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        className="bg-white rounded-lg"
      />
    </div>
  );
}
