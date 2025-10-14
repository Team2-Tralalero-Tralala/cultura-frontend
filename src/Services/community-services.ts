import { api } from "@/Libs/axios";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type Role = "member" | "admin" | "superadmin";
const roleToPrefix = (role: Role) => (role === "superadmin" ? "super" : role);

export type CommunityRow = {
  id: number;
  name: string;
  province: string;
  admin: string;
  status: string; // OPEN | CLOSED
};


export async function fetchCommunitiesByRole(role: Role, page: number, limit: number) {
  const prefix = roleToPrefix(role);
  const url = role === "admin" ? `${apiUrl}/admin/community` : `${apiUrl}/${prefix}/communities`;

  const res = await axios.get(url, {
    params: role === "superadmin" ? { page, limit } : undefined,
    withCredentials: true, // สำคัญ! ให้ส่ง cookie ไปหา backend
  });

  // โครงจาก backend ของคุณ: { data: { data: [...], pagination: {...} } }
  const payload = res.data?.data ?? {};
  const list = Array.isArray(payload?.data)
    ? payload.data
    : payload?.id
    ? [payload]
    : [];

  const rows: CommunityRow[] = list.map((c: any) => {
    const adminFull = `${c?.admin?.fname ?? ""} ${c?.admin?.lname ?? ""}`.trim();
    return {
      id: Number(c.id),
      name: c.name ?? "(ไม่มีชื่อ)",
      province: c.location?.province ?? "-",
      admin: adminFull || c?.admin?.username || (c.adminId ? `ID ${c.adminId}` : "-"),
      status: typeof c.status === "string" ? c.status : (c.status?.toString?.() ?? "-"),
    };
  });

  const total = Number(payload?.pagination?.totalCount ?? rows.length) || 0;
  return { rows, total, page, limit };
}

export async function fetchCommunityDetail(communityId: number) {
  const res = await api.get(`/super/community/detail/${communityId}`, {
    withCredentials: true,
  });

  // ตรงนี้จะได้ข้อมูลจาก backend ตาม structure ที่ส่งมาเลย
  return res.data?.data;
}