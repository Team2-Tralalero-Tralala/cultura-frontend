/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของข้อมูลที่พัก (Homestay)
 * ใช้สำหรับดึงข้อมูลที่พักทั้งหมดในชุมชน (เฉพาะ SuperAdmin)
 *
 * Base URL: ${VITE_API_URL}/super/community/:communityId/homestays/all
 */

import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// ✅ axios instance (แนบ cookie อัตโนมัติ)
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึงข้อมูลที่พัก (homestay) ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Input :
 *   - communityId : รหัสชุมชน
 *   - page : หน้าที่ต้องการ (เริ่มต้น 1)
 *   - limit : จำนวนข้อมูลต่อหน้า (เริ่มต้น 10)
 * Output :
 *   - รายการ homestay ทั้งหมด + pagination metadata
 * Mapping : GET /super/community/:communityId/homestays/all
 */
export async function getHomestaysAll(
  communityId: number,
  page = 1,
  limit = 10
) {
  return api.get(`/super/community/${communityId}/homestays/all`, {
    params: { page, limit },
  });
}
