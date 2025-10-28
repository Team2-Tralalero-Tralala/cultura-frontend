/**
 * File: ManageMembers.tsx
 * Screen: จัดการสมาชิก (SuperAdmin)
 * หน้าที่:
 *  - ค้นหา + ตาราง + ปุ่ม "สร้างสมาชิก"
 *  - ใช้ DataTable (รองรับ pagination, isLoading, actions, selectable)
 * มาตรฐาน CS v1.1.1:
 *  - React Component: PascalCase
 *  - ตัวแปร/ฟังก์ชัน: camelCase 
 *  - ค่าคงที่สภาพแวดล้อม: UPPER_SNAKE_CASE (แนะนำ)
 *  - คอมเมนต์หัวไฟล์/หัวฟังก์ชัน/บล็อกสำคัญ
 **/

import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DataTable from "@/Components/Tables/Index";
import type {
    Column,
    BulkAction,
    DataTableActionsConfig,
    Pagination as TablePagination,
} from "@/Components/Tables/Types";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import Button from "@/Components/Button";

/* ENV */
const API_BASE_URL = import.meta.env.VITE_API_URL;

/* Row type -> MemberRow */
type MemberRow = {
    id: number;
    displayName: string; // ชื่อบัญชี
    roleName: string; // บทบาท
    contact: string; // ช่องทางติดต่อ
};

export default function ManageMembers() {
    const navigate = useNavigate();

    /* table states */
    const [rows, setRows] = React.useState<MemberRow[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    /* pagination states (server-driven) */
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [pageSize, setPageSize] = React.useState<number>(10);
    const [totalPages, setTotalPages] = React.useState<number>(1);
    const [totalCount, setTotalCount] = React.useState<number>(0);

    /* search (client) */
    const [searchQuery, setSearchQuery] = React.useState<string>("");

    const normalizeText = (s: string) =>
        (s ?? "")
            .toString()
            .toLowerCase()
            .normalize("NFC")
            .replace(/\s+/g, " ")
            .trim();

    const filteredRows = React.useMemo(() => {
        const normalizedQuery = normalizeText(searchQuery);
        if (!normalizedQuery) return rows;
        return rows.filter((r) =>
            [r.displayName, r.roleName, r.contact]
                .map(normalizeText)
                .some((h) => h.includes(normalizedQuery))
        );
    }, [rows, searchQuery]);

    React.useEffect(() => setCurrentPage(1), [searchQuery]);

    /* fetch data */
    const fetchMembers = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const resp = await axios.get(`${API_BASE_URL}/api/admin/accounts`, {
                params: { page: currentPage, limit: pageSize },
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            console.log(resp);

            const body = resp?.data;

            let rawList: any =
                body?.data?.data ??
                body?.data ??
                body?.items ??
                body?.rows ??
                body;

            if (!Array.isArray(rawList)) rawList = [];

            const totalCountValue =
                body?.pagination?.totalCount ??
                body?.data?.pagination?.totalCount ??
                body?.total ??
                body?.totalCount ??
                rawList.length;

            const totalPagesValue =
                body?.pagination?.totalPages ??
                body?.data?.pagination?.totalPages ??
                Math.max(1, Math.ceil((Number(totalCountValue) || 0) / pageSize));

            const mappedRows: MemberRow[] = rawList.map((m: any): MemberRow => ({
                id: Number(m?.id ?? m?.userId ?? 0),
                displayName:
                    [m?.fname, m?.lname].filter(Boolean).join(" ").trim() ||
                    m?.username ||
                    "-",
                roleName: m?.role?.name ?? m?.roleName ?? "-",
                contact: m?.email ?? m?.phone ?? "-",
            }));

            setRows(mappedRows);
            setTotalCount(Number(totalCountValue) || mappedRows.length);
            setTotalPages(Number.isFinite(totalPagesValue) ? Number(totalPagesValue) : 1);
        } catch (e: any) {
            console.error("fetch members error:", e?.response?.data ?? e);
            setErrorMessage(
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "โหลดข้อมูลไม่สำเร็จ"
            );
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    React.useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    /* columns */
    const columns: Column<MemberRow>[] = React.useMemo(
        () => [
            { key: "displayName", header: "ชื่อบัญชี", className: "min-w-[220px]" },
            { key: "roleName", header: "บทบาท", className: "min-w-[140px]" },
            { key: "contact", header: "ช่องทางติดต่อ", className: "min-w-[220px]" },
        ],
        []
    );

    /* actions column */
    const actions: DataTableActionsConfig<MemberRow> = React.useMemo(
        () => ({
            header: <span className="block w-full text-center">จัดการ</span>,
            align: "right",
            width: "120px",
            variant: "icons",
            items: () => ["edit", "delete"],
            callbacks: {
                users: (row) => navigate(`/super/members/${row.id}/roles`),
                edit: (row) => navigate(`/super/members/${row.id}/edit`),
                delete: async (row) => {
                    if (!window.confirm(`ยืนยันลบสมาชิก “${row.displayName}” ?`)) return;
                    try {
                        await axios.delete(`${API_BASE_URL}/super/members/${row.id}`, {
                            withCredentials: true,
                        });
                        await fetchMembers();
                    } catch (e: any) {
                        console.error("delete failed:", e?.response?.data ?? e);
                        alert(
                            `ลบไม่สำเร็จ: ${e?.response?.data?.message ||
                            e?.response?.data?.error ||
                            e?.message ||
                            "unknown error"
                            }`
                        );
                    }
                },
            },
        }),
        [navigate, fetchMembers]
    );

    /* bulk actions */
    const bulkActions: BulkAction<MemberRow>[] = React.useMemo(
        () => [
            {
                id: "bulk-delete",
                label: "ลบทั้งหมด",
                intent: "danger",
                confirm: (rows) => `ยืนยันลบสมาชิกจำนวน ${rows.length} รายการหรือไม่?`,
                onClick: async (rows) => {
                    const ids = rows.map((r) => r.id);
                    try {
                        await axios.request({
                            method: "delete",
                            url: `${API_BASE_URL}/super/members`,
                            data: { ids },
                            withCredentials: true,
                            headers: { "Content-Type": "application/json" },
                        });
                        await fetchMembers();
                    } catch (e) {
                        console.error("bulk delete failed:", e);
                        alert("ลบแบบกลุ่มไม่สำเร็จ");
                    }
                },
            },
        ],
        [fetchMembers]
    );

    /* header actions */
    const handleCreateMember = () => navigate("/super/members/create");

    /* pagination object for DataTable */
    const pagination: TablePagination = {
        currentPage,
        totalPages,
        totalCount,
        limit: pageSize, // คง key ชื่อ limit ตามชนิด TablePagination
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl">จัดการสมาชิก</h1>

                <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md">
                        <SearchBarTable
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="ml-auto">
                        <Button type="confirm-admin" onClick={handleCreateMember}>
                            + สร้างสมาชิก
                        </Button>
                    </div>
                </div>
            </div>

            {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

            {/* Table */}
            <DataTable<MemberRow>
                data={filteredRows}
                getKey={(r) => String(r.id)}
                columns={columns}
                actions={actions}
                selectable
                bulkActions={bulkActions}
                theme="brand"
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 50]}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(s) => {
                    setPageSize(s);
                    setCurrentPage(1);
                }}
                pagination={pagination}
                isLoading={isLoading}
            />
        </div>
    );
}