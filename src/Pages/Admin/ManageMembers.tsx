/**
 * File: ManageMembers.tsx
 * Screen: จัดการสมาชิก (SuperAdmin)
 * หน้าที่:
 *  - ค้นหา + ตาราง + ปุ่ม "สร้างสมาชิก"
 *  - ใช้ DataTable (รองรับ pagination, isLoading, actions, selectable)
 * มาตรฐาน CS v1.1.1:
 *  - React Component: PascalCase
 *  - ตัวแปร/ฟังก์ชัน: camelCase
 *  - คอมเมนต์หัวไฟล์/หัวฟังก์ชัน/บล็อกสำคัญ
 */

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
import { deleteCommunityMember } from "@/Services/deleate-member-community-service";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiBaseUrl = import.meta.env.VITE_API_URL;

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

    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<MemberRow | null>(null);

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

            const response = await axios.get(`http://localhost:3000/api/admin/communities/members`, {
                params: { page: currentPage, limit: pageSize },
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            console.log(response);

            const responseBody = response?.data;

            let rawMemberList: any =
                responseBody?.data?.data ??
                responseBody?.data ??
                responseBody?.items ??
                responseBody?.rows ??
                responseBody;

            if (!Array.isArray(rawMemberList)) rawMemberList = [];

            const resolvedTotalCount =
                responseBody?.pagination?.totalCount ??
                responseBody?.data?.pagination?.totalCount ??
                responseBody?.total ??
                responseBody?.totalCount ??
                rawMemberList.length;

            const resolvedTotalPages =
                responseBody?.pagination?.totalPages ??
                responseBody?.data?.pagination?.totalPages ??
                Math.max(1, Math.ceil((Number(resolvedTotalCount) || 0) / pageSize));

            const memberRows: MemberRow[] = rawMemberList.map((m: any): MemberRow => ({
                id: Number(m?.id ?? m?.userId ?? 0),
                displayName:
                    [m?.fname, m?.lname].filter(Boolean).join(" ").trim() ||
                    m?.username ||
                    "-",
                roleName: m?.role?.name ?? m?.roleName ?? "-",
                contact: m?.email ?? m?.phone ?? "-",
            }));

            setRows(memberRows);
            setTotalCount(Number(resolvedTotalCount) || memberRows.length);
            setTotalPages(Number.isFinite(resolvedTotalPages) ? Number(resolvedTotalPages) : 1);
        } catch (error: any) {
            console.error("fetch members error:", error?.response?.data ?? error);
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
                    setSelectedRow(row);
                    setOpenDeleteModal(true);
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
                            url: `${apiBaseUrl}/super/members`,
                            data: { ids },
                            withCredentials: true,
                            headers: { "Content-Type": "application/json" },
                        });
                        await fetchMembers();
                    } catch (error) {
                        console.error("bulk delete failed:", error);
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
        <>
            {/* <Breadcrumb
                item={[
                    { label: "จัดการสมาชิก"}
                ]}
            /> */}
            <div className="text-sm mb-2 text-[#000]">
                {/* <a
                    href="/admin/community/own"
                    className="text-gray-900 hover:underline font-medium"
                    aria-label="กลับไปหน้าแรก (ชุมชนทั้งหมด)"
                >
                    จัดการสมาชิก
                </a>
                <span className="mx-1 text-gray-500" aria-hidden>
                    &gt;
                </span> */}
                <span>จัดการสมาชิก</span>
            </div>
        <div className="space-y-4">
            {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-[20px] font-bold">จัดการสมาชิก</h1>

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
            {/* Delete Confirmation Modal */}
            {openDeleteModal && selectedRow && (
                <Modal
                    open={openDeleteModal}
                    title="ยืนยันการลบสมาชิก"
                    text={`คุณต้องการลบสมาชิก “${selectedRow.displayName}” ใช่หรือไม่?`}
                    confirmText="ลบ"
                    cancelText="ยกเลิก"
                    onConfirm={async () => {
                        try {
                            await deleteCommunityMember(selectedRow.id);
                            await fetchMembers();
                        } catch (error: any) {
                            alert(
                                `ลบไม่สำเร็จ: ${error?.response?.data?.message ||
                                error?.response?.data?.error ||
                                error?.message ||
                                "unknown error"
                                }`
                            );
                        } finally {
                            setOpenDeleteModal(false);
                            setSelectedRow(null);
                        }
                    }}
                    onCancel={() => {
                        setOpenDeleteModal(false);
                        setSelectedRow(null);
                    }}
                />
            )}
        </div>
        </>
    );
}