/**
 * คำอธิบาย : Service สำหรับจัดการบัญชีผู้ใช้งาน (Account Services)
 * ใช้สำหรับเชื่อมต่อ API ที่เกี่ยวข้องกับผู้ใช้ เช่น ดึงรายชื่อผู้ใช้ที่ถูกระงับ,
 * ดึงรายละเอียดผู้ใช้, จัดการ token และการตอบสนองจากเซิร์ฟเวอร์
 *
 */

import axios from "axios";

/** ===========================
 * ประเภทข้อมูล (Type Definitions)
 * =========================== */
export type Role = "admin" | "superadmin";

export type UserRow = {
  id: number;
  username: string;
  activityRole: string;
  email: string;
  BLOCKED: boolean;
};

/** ===========================
 * สร้าง instance ของ Axios
 * - baseURL มาจาก ENV (รองรับหลายรูปแบบ)
 * - withCredentials เพื่อแนบ cookie อัตโนมัติ
 * - Content-Type: application/json
 * =========================== */
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด (SuperAdmin)
 * Mapping: GET /super/accounts
 * Params: page, limit, searchName, filterRole (optional)
 */
export async function fetchAccounts(
  page: number,
  limit: number,
  searchName?: string,
  filterRole?: string
) {
  const url = `/super/accounts`;

  const res = await api.get(url, {
    params: {
      page,
      limit,
      searchName,
      filterRole,
    },
    withCredentials: true,
  });

  return res.data;
}

/**
 * ดึงข้อมูลผู้ใช้ที่ถูกระงับการใช้งาน (BLOCKED)
 * Mapping: GET /super/users/status/BLOCKED
 */
export async function fetchBlockedAccounts(page: number, limit: number, searchName?: string) {
  const res = await api.get(`/super/accounts/status/BLOCKED`, {
    params: { page, limit, searchName },
    withCredentials: true,
  });
  return res.data;
}

/**
 * ยกเลิกการระงับผู้ใช้รายเดียว
 */
export async function unblockAccountById(userId: number) {
  return await api.put(`/super/users/unblock/${userId}`, {}, { withCredentials: true });
}

/**
 * ยกเลิกการระงับหลายรายการ
 */
export async function unblockMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await unblockAccountById(id);
  }
}

/**
 * ระงับการใช้งานผู้ใช้รายเดียว (Block Account)
 * Mapping: PUT /super/users/block/:userId
 */
export async function blockAccountById(userId: number) {
  return await api.put(`/super/users/block/${userId}`, {}, { withCredentials: true });
}

/**
 * ระงับการใช้งานหลายรายการ (Block หลายบัญชี)
 */
export async function blockMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await blockAccountById(id);
  }
}

/**
 * ลบบัญชีผู้ใช้รายเดียว (Soft Delete)
 * Mapping: PATCH /super/users/:userId
 */
export async function deleteAccountById(userId: number) {
  const res = await api.patch(`/super/users/${userId}`, {}, { withCredentials: true });
  return res.data;
}

/**
 * ลบผู้ใช้หลายรายการ (Bulk Delete)
 */
export async function deleteMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await deleteAccountById(id);
  }
}

/** ===========================
 * ฟังก์ชัน: fetchUserDetail()
 * วัตถุประสงค์ : ดึงรายละเอียดของผู้ใช้ตาม userId
 * Input  : userId (หมายเลขผู้ใช้)
 * Output : ข้อมูลรายละเอียดของผู้ใช้ (object)
 * =========================== */
export async function fetchUserDetail(userId: number) {
  const res = await api.get(`/super/users/${userId}`);
  return res.data?.data;
}
