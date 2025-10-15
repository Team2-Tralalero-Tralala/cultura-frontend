// Services/user-services.ts
import axios from "axios";
import type { UserRow, UserDtoFromApi, PaginationResponse } from "@/Types/User";

const apiUrl = import.meta.env.VITE_API_URL;

export type Role = "admin" | "superadmin";
const roleToPrefix = (role: Role) => (role === "superadmin" ? "super" : role);

/*
 * ดึงผู้ใช้ที่ถูก BLOCKED ตาม role
 */
export async function fetchBlockedUsersByRole(
  role: Role,
  page: number,
  limit: number
): Promise<PaginationResponse<UserRow>> {
  const url = `${apiUrl}/super/users/status/BLOCKED`;

  const res = await axios.get(url, {
    params: { page, limit },
    withCredentials: true,
  });

  const payload = res.data?.data;
  const list: UserDtoFromApi[] = Array.isArray(payload?.data) ? payload.data : [];

  const rows: UserRow[] = list.map((u) => ({
    id: Number(u.id),
    username: u.username ?? "(ไม่มีชื่อ)",
    activityRole: u.activityRole ?? "-",
    email: u.email ?? "-",
    BLOCKED: u.status === "BLOCKED",
  }));

  const total = Number(payload?.pagination?.totalCount ?? rows.length) || 0;

  return { items: rows, total, page, limit };
}

/*
 * ดึงรายละเอียดผู้ใช้ตาม userId
 */
export async function fetchUserDetail(userId: number): Promise<UserRow | null> {
  const res = await axios.get(`${apiUrl}/super/users/${userId}`, {
    withCredentials: true,
  });

  const u: UserDtoFromApi | null = res.data?.data ?? null;
  if (!u) return null;

  return {
    id: Number(u.id),
    username: u.username ?? "(ไม่มีชื่อ)",
    activityRole: u.activityRole ?? "-",
    email: u.email ?? "-",
    BLOCKED: u.status === "BLOCKED",
  };
}