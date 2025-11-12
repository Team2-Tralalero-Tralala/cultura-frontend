// src/Pages/Member/ManagePackageMember.tsx
/**
 * จัดการแพ็กเกจ (Member) — ดึงข้อมูลด้วย axios โดยตรง (สไตล์เดียวกับ SuperAdmin)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/Components/Tables/Index";
import type { Column, DataTableActionsConfig, BulkAction } from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import axios from "axios";
import Button from "@/Components/Button";

const apiUrl = import.meta.env.VITE_API_URL;

// ===== Row type ภายในไฟล์ =====
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
      // TODO: เรียก API bulk ถ้ามี
    },
  },
];

export default function ManagePackagePage() {
  const navigate = useNavigate();

  // table state
  const [tableRows, setTableRows] = React.useState<Row[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // โหลดข้อมูลด้วย axios ตรง ๆ (เหมือนตัวอย่าง SuperAdmin แต่เปลี่ยน path เป็น /member/)
  const reloadPackages = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await axios.get(`${apiUrl}/member/packages`, {
        params: { page: currentPage, limit: pageSize },
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const payload = res?.data;

      // รองรับหลายทรง payload
      let listRaw: any =
        payload?.data?.data ?? payload?.data ?? payload?.items ?? payload?.rows ?? payload;

      if (!Array.isArray(listRaw)) {
        console.warn("Expected array but got:", listRaw);
        listRaw = [];
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
            ? `${p.overseerPackage.fname ?? ""} ${p.overseerPackage.lname ?? ""}`.trim() ||
              p.overseerPackage.username ||
              "-"
            : p?.ownerName ?? "-",
          published:
            p?.statusPackage === "PUBLISH" || p?.published === true || p?.isPublished === true,
          approved:
            p?.statusApprove === "APPROVE" || p?.approved === true || p?.isApproved === true,
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

  // actions ต่อแถว (แก้ path เป็นของ member)
  const rowActions: DataTableActionsConfig<Row> = React.useMemo(
    () => ({
      header: "จัดการ",
      align: "right",
      width: "120px",
      variant: "icons",
      items: () => ["edit", "delete"],
      callbacks: {
        edit: (row) => navigate(`/member/package/edit/${row.id}`),
        delete: async (row) => {
          if (!window.confirm(`ยืนยันลบแพ็กเกจ "${row.title}" ?`)) return;
          try {
            // สมมติ soft-delete
            await axios.patch(
              `${apiUrl}/member/package/${row.id}/delete`,
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
    (s ?? "").toString().toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

  const toPublishedText = (r: Row) => (r.published ? "เผยแพร่" : "ไม่เผยแพร่");
  const toApprovedText = (r: Row) => (r.approved ? "อนุมัติ" : "รออนุมัติ");

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

  const goToCreatePackage = () => navigate("/member/package/create");
  const goToApprovalRequests = () => navigate("/member/booking");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBarTable value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button type="confirm-admin" onClick={goToApprovalRequests}>
              คำขออนุมัติ
            </Button>
            <Button type="confirm-admin" onClick={goToCreatePackage}>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="text-xl leading-none">＋</span>
                <span>สร้างแพ็กเกจ</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

      <DataTable<Row>
        isLoading={isLoading}
        data={filteredRows}
        columns={columns}
        getKey={(r) => String(r.id)}
        actions={rowActions}
        bulkActions={bulkActions}
        selectable
        pageSizeOptions={[10, 20, 50]}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        theme="brand"
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / pageSize),
          totalCount: totalItems,
          limit: pageSize,
        }}
      />
    </div>
  );
}
