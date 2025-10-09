import { api } from "../Libs/axios";
import type { PackageRow } from "../Types/Package";

// แทน type เดิม
type ApiEnvelope<T> = {
    status: number;
    error: boolean;
    message: string;
    data: T;
};

type PayloadList = {
    data: Array<{
        id: number;
        name: string;
        community?: { name: string } | null;
        statusPackage: string | null;
        statusApprove: string | null;
    }>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
};

const PATH_BY_ROLE = {
    superadmin: "/super/packages",
    admin: "/admin/packages",
    member: "/member/packages",
} as const;

export async function fetchPackagesByRole(
    role: keyof typeof PATH_BY_ROLE,
    page = 1,
    limit = 10
) {
    // ⬇️ รับซองใหญ่
    const res = await api.get<ApiEnvelope<PayloadList>>(PATH_BY_ROLE[role], {
        params: { page, limit },
    });

    // ⬇️ ดึง payload ข้างใน
    const payload = res.data.data;
    const list = Array.isArray(payload?.data) ? payload.data : [];

    const rows: PackageRow[] = list.map((p) => ({
        id: p.id,
        title: p.name,
        community: p.community?.name ?? "-",
        owner: "-", // เติมภายหลังถ้ามีใน API
        published: p.statusPackage === "PUBLISH",
        approved: p.statusApprove === "APPROVE",
    }));

    return {
        rows,
        total: payload.pagination?.totalCount ?? rows.length,
        page: payload.pagination?.currentPage ?? page,
        limit: payload.pagination?.limit ?? limit,
    };
}
