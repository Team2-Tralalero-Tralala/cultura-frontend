/**
 * คำอธิบาย : Service สำหรับจัดการบัญชีผู้ใช้งาน (Account Services)
 * ใช้สำหรับเชื่อมต่อ API ที่เกี่ยวข้องกับผู้ใช้ เช่น ดึงรายชื่อผู้ใช้ที่ถูกระงับ,
 * ดึงรายละเอียดผู้ใช้, จัดการ token และการตอบสนองจากเซิร์ฟเวอร์
 *
 */

import axios from "axios";

/** ===========================
 * 🧩 ประเภทข้อมูล (Type Definitions)
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
 * ⚙️ สร้าง instance ของ Axios
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

/** ===========================
 * 📋 ฟังก์ชัน: fetchBlockedUsersByRole()
 * วัตถุประสงค์ : ดึงรายชื่อผู้ใช้ที่ถูกระงับการใช้งานตาม Role
 * Input  :
 *    - role (admin / superadmin)
 *    - page, limit (ใช้สำหรับ pagination)
 * Output :
 *    - { rows, total, page, limit }
 * =========================== */
export async function fetchBlockedUsersByRole(
  role: Role,
  page = 1,
  limit = 10
) {
  const rolePrefix = role === "superadmin" ? "super" : "admin";
  const url = `/${rolePrefix}/users/status/BLOCKED`;

  const res = await api.get(url, { params: { page, limit } });
  const payload = res.data?.data ?? res.data;

  // ✅ ตรวจสอบโครงสร้างข้อมูลที่กลับมาจาก API
  const list: any[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  // 🔄 Map ข้อมูลที่ได้ให้เป็นรูปแบบ UserRow
  const rows: UserRow[] = list.map((u) => ({
    id: Number(u.id),
    username: u.username ?? "(ไม่มีชื่อ)",
    activityRole: u.activityRole ?? "-",
    email: u.email ?? "-",
    BLOCKED: u.status === "BLOCKED",
  }));

  const total = Number(payload?.pagination?.totalCount ?? list.length) || 0;
  return { rows, total, page, limit };
}

/** ===========================
 * 👤 ฟังก์ชัน: fetchUserDetail()
 * วัตถุประสงค์ : ดึงรายละเอียดของผู้ใช้ตาม userId
 * Input  : userId (หมายเลขผู้ใช้)
 * Output : ข้อมูลรายละเอียดของผู้ใช้ (object)
 * =========================== */
export async function fetchUserDetail(userId: number) {
  const res = await api.get(`/super/users/${userId}`);
  return res.data?.data;
}
