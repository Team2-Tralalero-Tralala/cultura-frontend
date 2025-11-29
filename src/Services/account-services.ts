/**
 * คำอธิบาย : Service สำหรับจัดการบัญชีผู้ใช้งาน (Account Services)
 * ใช้สำหรับเชื่อมต่อ API ที่เกี่ยวข้องกับผู้ใช้ เช่น ดึงรายชื่อผู้ใช้ที่ถูกระงับ,
 * ดึงรายละเอียดผู้ใช้, ระงับ / ยกเลิกระงับบัญชี และลบบัญชี
 * ใช้ในฝั่ง Client (Frontend)
 */

import axios from "axios";

/**
 * สร้าง instance ของ Axios
 * - baseURL มาจาก ENV (รองรับหลายรูปแบบ)
 * - withCredentials เพื่อแนบ cookie อัตโนมัติ
 * - Content-Type: application/json
 */
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * ฟังก์ชัน: fetchAccounts
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ทั้งหมด (SuperAdmin)
 * Mapping: GET /super/accounts
 * Input: page, limit, searchName?, filterRole?
 * Output: รายการบัญชีผู้ใช้ทั้งหมด
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
 * ฟังก์ชัน: fetchBlockedAccounts
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ที่ถูกระงับการใช้งาน (BLOCKED)
 * Mapping: GET /super/accounts/status/BLOCKED
 * Input: page, limit, searchName?
 * Output: รายการบัญชีที่ถูกระงับ
 */
export async function fetchBlockedAccounts(page: number, limit: number, searchName?: string) {
  const res = await api.get(`/super/accounts/BLOCKED`, {
    params: { page, limit, searchName },
    withCredentials: true,
  });
  return res.data;
}

/**
 * ฟังก์ชัน: unblockAccountById
 * วัตถุประสงค์: ยกเลิกการระงับบัญชีผู้ใช้รายเดียว
 * Mapping: PUT /super/users/unblock/:userId
 * Input: userId (หมายเลขผู้ใช้)
 * Output: ไม่มี (ส่งคำขอไปยัง API เท่านั้น)
 */
export async function unblockAccountById(userId: number) {
  return await api.put(`/super/users/unblock/${userId}`, {}, { withCredentials: true });
}

/**
 * ฟังก์ชัน: unblockMultipleAccounts
 * วัตถุประสงค์: ยกเลิกการระงับบัญชีหลายรายการ
 * Input: ids (array ของหมายเลขผู้ใช้)
 * Output: ไม่มี
 */
export async function unblockMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await unblockAccountById(id);
  }
}

/**
 * ฟังก์ชัน: blockAccountById
 * วัตถุประสงค์: ระงับการใช้งานบัญชีผู้ใช้รายเดียว
 * Mapping: PUT /super/users/block/:userId
 * Input: userId (หมายเลขผู้ใช้)
 * Output: ไม่มี
 */
export async function blockAccountById(userId: number) {
  return await api.put(`/super/users/block/${userId}`, {}, { withCredentials: true });
}

/**
 * ฟังก์ชัน: blockMultipleAccounts
 * วัตถุประสงค์: ระงับการใช้งานหลายบัญชี (Block หลายรายการ)
 * Input: ids (array ของหมายเลขผู้ใช้)
 * Output: ไม่มี
 */
export async function blockMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await blockAccountById(id);
  }
}

/**
 * ฟังก์ชัน: deleteAccountById
 * วัตถุประสงค์: ลบบัญชีผู้ใช้รายเดียว (Soft Delete)
 * Mapping: PATCH /super/users/:userId
 * Input: userId (หมายเลขผู้ใช้)
 * Output: ผลลัพธ์การลบจาก API
 */
export async function deleteAccountById(userId: number) {
  const res = await api.patch(`/super/users/${userId}`, {}, { withCredentials: true });
  return res.data;
}

/**
 * ฟังก์ชัน: deleteMultipleAccounts
 * วัตถุประสงค์: ลบบัญชีผู้ใช้หลายรายการ (Bulk Delete)
 * Input: ids (array ของหมายเลขผู้ใช้)
 * Output: ไม่มี
 */
export async function deleteMultipleAccounts(ids: number[]) {
  for (const id of ids) {
    await deleteAccountById(id);
  }
}

/**
 * ฟังก์ชัน: fetchUserDetail
 * วัตถุประสงค์: ดึงรายละเอียดของผู้ใช้ตาม userId (SuperAdmin)
 * Mapping: GET /super/users/:userId
 * Input: userId (หมายเลขผู้ใช้)
 * Output: ข้อมูลรายละเอียดผู้ใช้
 */
export async function fetchUserDetail(userId: number) {
  const res = await api.get(`/super/users/${userId}`);
  return res.data?.data;
}

/**
 * ฟังก์ชัน: fetchMemberDetail
 * วัตถุประสงค์: ดึงรายละเอียดของสมาชิกในชุมชน (Admin)
 * Mapping: GET /admin/member/:userId
 * Input: userId (หมายเลขผู้ใช้)
 * Output: ข้อมูลรายละเอียดสมาชิก
 */
export async function fetchMemberDetail(userId: number) {
  const res = await api.get(`/admin/member/${userId}`);
  return res.data?.data;
}