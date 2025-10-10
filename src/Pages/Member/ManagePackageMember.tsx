// src/Pages/Member/ManagePackageMember.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DataTable from "../../Components/Tables/Index";
import type {
    Column,
    DataTableActionsConfig,
    BulkAction,
} from "../../Components/Tables/Types";
import { TrashIcon } from "../../Components/Tables/Icon";
import type { PackageRow } from "../../Types/Package";
import SearchBarTable from "../../Components/Search/SerachBarTable";

const apiUrl = import.meta.env.VITE_API_URL;

export async function fetchPackagesByRole(
    role: "member" | "admin" | "superadmin",
    page: number,
    limit: number
) {
    const res = await axios.get(`${apiUrl}/${role}/packages`, {
        params: { page, limit },
        withCredentials: true,
    });

    // ⬇️ payload จริงอยู่ใน res.data.data.data (ซ้อนสองชั้น)
    const obj = res.data?.data?.data ?? {}; // object keyed-by-id
    const list = Array.isArray(obj) ? obj : Object.values(obj); // แปลงเป็น array

    const total =
        Number(res.data?.data?.pagination?.totalCount ?? list.length) || 0;

    const rows = list.map((p: any) => {
        const fullName = `${p.overseerPackage?.fname ?? ""} ${p.overseerPackage?.lname ?? ""}`.trim();
        const ownerName =
            p.overseerPackage?.name?.trim?.() ||
            (fullName || undefined) ||
            p.overseerPackage?.username ||
            (p.overseerMemberId ? `ID ${p.overseerMemberId}` : "-");

        return {
            id: Number(p.id),
            title: p.name ?? p.title ?? "(ไม่มีชื่อ)",
            community: p.community?.name ?? (p.communityId ? `ID ${p.communityId}` : "-"),
            owner: ownerName ?? "-",
            published: p.statusPackage === "PUBLISH" || !!p.published,
            approved: p.statusApprove === "APPROVE" || !!p.approved,
        };
    });

    return { rows, total };
}
// ---------------------------------------------------------------------

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
            // TODO: เรียก API bulk ถ้ามี
            // await axios.post(`${apiUrl}/member/packages/bulk-delete`, { ids }, { withCredentials: true });
        },
    },
];

export default function ManagePackageMember() {
    const navigate = useNavigate();

    // state หลักของตาราง
    const [rows, setRows] = React.useState<PackageRow[]>([]);
    const [page, setPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [total, setTotal] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    // โหลดข้อมูล (role = member)
    const reloadPackages = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { rows, total } = await fetchPackagesByRole("member", page, limit);
            setRows(rows);
            setTotal(total);
        } catch (e: any) {
            setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    // actions ต่อแถว
    const actions: DataTableActionsConfig<PackageRow> = React.useMemo(
        () => ({
            header: "จัดการ",
            align: "right",
            width: "120px",
            variant: "icons",
            items: () => ["edit", "delete"],
            callbacks: {
                // ไปหน้าแก้ไขของ member
                edit: (r) => navigate(`/member/package/${r.id}`),
                // ลบของตัวเอง (ปรับเป็น axios + VITE_API_URL)
                delete: async (r) => {
                    if (!window.confirm(`ยืนยันลบแพ็กเกจ "${r.title}" ?`)) return;
                    try {
                        // ปรับ path และ method ให้ตรง backend:
                        // ตัวอย่าง: PATCH /member/package/:id  (soft-delete)
                        await axios.patch(
                            `${apiUrl}/member/package/${r.id}`,
                            {},
                            { withCredentials: true }
                        );
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
    const toApprovedText = (r: PackageRow) => (r.approved ? "อนุมัติ" : "รออนุมัติ");

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

    // ปุ่มสร้างแพ็กเกจใหม่
    const goToCreatePackage = () => navigate("/member/package");
    const goToApprovalRequests = () => navigate("/member/booking");

    const pendingCount = React.useMemo(() => rows.filter((r) => !r.approved).length, [rows]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl">จัดการแพ็กเกจ</h1>

                {/* แถวเดียวกัน */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md">
                        <SearchBarTable value={query} onChange={(e) => setQuery(e.target.value)} />
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
