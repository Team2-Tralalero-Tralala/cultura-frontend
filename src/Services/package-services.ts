import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type Role = "member" | "admin" | "superadmin";

const roleToPrefix = (role: Role) => (role === "superadmin" ? "super" : role);

export async function fetchPackagesByRole(role: Role, page: number, limit: number) {
    const prefix = roleToPrefix(role);             // <-- แปลงตรงนี้
    const res = await axios.get(`${apiUrl}/${prefix}/packages`, {
        params: { page, limit },
        withCredentials: true,
    });

    const obj = res.data?.data?.data ?? {};
    const list: any[] = Array.isArray(obj) ? obj : Object.values(obj);

    const total = Number(res.data?.data?.pagination?.totalCount ?? list.length) || 0;

    const rows = list.map((p: any) => {
        const ov = p.overseerPackage ?? p.owner ?? p.overseer ?? null;
        const fullName = `${ov?.fname ?? ""} ${ov?.lname ?? ""}`.trim();
        const ownerName =
            ov?.name?.trim?.() ||
            (fullName || undefined) ||
            ov?.username ||
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

    return { rows, total, page, limit };
}
