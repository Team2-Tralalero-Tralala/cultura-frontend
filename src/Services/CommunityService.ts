// src/Libs/CommunityService.ts
/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของวิสาหกิจชุมชน (Community)
 * รูปแบบอิงไฟล์เดิมของคุณ แต่ Map type ให้เข้ากับ src/Types/Community.ts
 *
 * Backend ที่ใช้:
 *   - GET /super/communities?page=&limit=         (list)
 *   - GET /super/community/detail/:communityId    (detail)
 *   - POST/PUT/PATCH /super/community             (CRUD - สไตล์เพื่อนคุณ)
 */

import axios from "axios";
import type { CommunityFormData } from "@/Types/CommunityForm";
import type { CommunityRow, CommunityDtoFromApi, PaginationResponse } from "@/Types/Community";

const apiUrl = import.meta.env.VITE_API_URL;

// ✅ ใช้ instance เดียวและใส่ withCredentials ที่ config (ไม่ยัดผิดที่)
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

/* =========================================
 * LIST: แปลง payload จาก backend → CommunityRow[]
 * =========================================
 * Backend response shape (ตาม service หลังบ้าน):
 *   { data: { data: CommunityDtoFromApi[], pagination: {...} } }
 */
export async function getCommunities(
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<CommunityRow>> {
  const res = await api.get("/super/communities", { params: { page, limit } });
  const payload = res?.data?.data ?? {};
  const list: CommunityDtoFromApi[] = Array.isArray(payload?.data) ? payload.data : [];

  const items: CommunityRow[] = list.map((c) => {
    const adminFull = `${c?.admin?.fname ?? ""} ${c?.admin?.lname ?? ""}`.trim();
    return {
      id: Number(c.id),
      name: c.name ?? "(ไม่มีชื่อ)",
      province: c.location?.province ?? "-",
      admin: adminFull || "-",
      status: typeof c.status === "string" ? c.status : (c as any)?.status?.toString?.() ?? "-",
    };
  });

  const total = Number(payload?.pagination?.totalCount ?? items.length) || 0;
  const pageNum = Number(payload?.pagination?.currentPage ?? page) || page;
  const lim = Number(payload?.pagination?.limit ?? limit) || limit;

  return {
    items,
    total,
    page: pageNum,
    limit: lim,
  };
}

/* =========================================
 * DETAIL: ดึงข้อมูลตาม communityId
 * =========================================
 * หมายเหตุ: ฝั่ง backend ของคุณใช้ path /super/community/detail/:communityId
 * โครง detail รวม relations เยอะกว่า CommunityDtoFromApi
 * เลยคืนเป็น unknown/any ให้หน้า Detail แม็ปต่อเอง
 */
export async function getCommunityDetailById(communityId: number) {
  const res = await api.get(`/super/community/detail/${communityId}`);
  return res.data?.data as unknown; // หรือเปลี่ยนเป็น type เฉพาะถ้าคุณนิยามเพิ่ม
}

/* =========================================
 * CRUD (สไตล์เพื่อนคุณ) — แก้ config ให้ถูกต้อง
 * =========================================
 * NOTE: ถ้าหลังบ้านยังไม่มีเส้นทางเหล่านี้ ให้เติมภายหลังได้โดยไม่ต้องแก้ FE
 */
export async function createCommunity(data: CommunityFormData) {
  return await api.post(`/super/community`, data);
}

export async function getCommunityById(id: number) {
  // เดิมของคุณยิง /super/community/:id → ปรับให้ตรง backend จริงของคุณแล้ว
  return await api.get(`/super/community/detail/${id}`);
}

export async function updateCommunity(id: number, data: CommunityFormData) {
  // แก้บั๊ก comma operator + ย้าย withCredentials มาถูกที่ (บน instance)
  return await api.put(`/super/community/${id}`, data);
}

export async function deleteCommunity(id: number) {
  // แก้: อย่าส่ง { withCredentials } เป็น body — ให้เป็น config (อยู่บน instanceแล้ว)
  return await api.patch(`/super/community/${id}`);
}

/* =========================================
 * Helper endpoints (ถ้ามีหลังบ้านไว้แล้ว)
 * ========================================= */
export async function getUnassignedAdmins() {
  return await api.get(`/super/admins/unassigned`);
}
export async function getUnassignedMembers() {
  return await api.get(`/super/members/unassigned`);
}
